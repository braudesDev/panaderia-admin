import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signOut,
  User,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInWithRedirect,
  User as FirebaseUser,
  onAuthStateChanged
} from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  collectionData
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Usuario } from '../models/usuario.model';




interface UsuarioData {
  correo?: string;
  rol: 'admin' | 'cliente' | 'repartidor' | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _estaLogueado$ = new BehaviorSubject<boolean>(false);
  estaLogueado$ = this._estaLogueado$.asObservable();

  private _rolUsuario$ = new BehaviorSubject<string | null>(null);
  rolUsuario$ = this._rolUsuario$.asObservable();

  private usuarioActual: { uid: string; email: string | null; displayName: string | null } | null = null;
  private rol: UsuarioData['rol'] = null;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.cargarEstadoPersistido();
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    return collectionData(usuariosRef, { idField: 'uid' }) as Observable<Usuario[]>;
  }

  private cargarEstadoPersistido(): void {
    const rolGuardado = localStorage.getItem('rol') as UsuarioData['rol'];
    const usuarioGuardado = localStorage.getItem('usuario');

    if (rolGuardado && usuarioGuardado) {
      this.rol = rolGuardado;
      this.usuarioActual = JSON.parse(usuarioGuardado);

    // Emitir cambios para que los subscriptores actualicen
    this._estaLogueado$.next(true);
    this._rolUsuario$.next(this.rol);
    }
  }


registrarConEmail(correo: string, contrasena: string, nombre: string) {
  return createUserWithEmailAndPassword(this.auth, correo, contrasena)
    .then(async cred => {
      if (!cred.user) throw new Error('No se pudo crear el usuario');

      await updateProfile(cred.user, { displayName: nombre });

      await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre,
        correo: correo,
        creadoEn: new Date()
      });

      return cred;
    })
    .catch(async error => {
      if (error.code === 'auth/email-already-in-use') {
        await Swal.fire({
          icon: 'error',
          title: 'Correo en uso',
          text: 'Este correo ya está registrado. Por favor, inicia sesión o usa otro correo.',
          confirmButtonColor: '#3085d6'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: error.message || 'Ocurrió un error inesperado',
          confirmButtonColor: '#d33'
        });
      }
      throw error; // opcional si quieres manejar el error más arriba
    });
}



async loginConGoogle(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const usuario = result.user;

    this.usuarioActual = {
      uid: usuario.uid,
      email: usuario.email,
      displayName: usuario.displayName
    };

    const docRef = doc(this.firestore, 'usuarios', usuario.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        correo: usuario.email,
        rol: 'cliente'
      });
      this.rol = 'cliente';
      this.persistirEstado(this.usuarioActual, this.rol);

      // 👇 Agrega esto para actualizar el header sin recargar
      this._estaLogueado$.next(true);
      this._rolUsuario$.next(this.rol);

      this.redirigirPorRol();
      return;
    }

    const data = docSnap.data() as UsuarioData;
    this.rol = data.rol || 'cliente';
    this.persistirEstado(this.usuarioActual, this.rol);

    this._estaLogueado$.next(true);
    this._rolUsuario$.next(this.rol);

    this.redirigirPorRol();

  } catch (error) {
    console.error('Error en login con Google', error);
    throw error;
  }
}

async loginConGoogleRedirect(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(this.auth, provider);
}



async loginConEmail(correo: string, contrasena: string): Promise<void> {
  try {
    const cred = await signInWithEmailAndPassword(this.auth, correo, contrasena);
    const usuario = cred.user;
    this.usuarioActual = usuario;

    const docRef = doc(this.firestore, 'usuarios', usuario.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        correo: usuario.email,
        rol: 'cliente',
      });
      this.rol = 'cliente';
    } else {
      const data = docSnap.data() as UsuarioData;
      this.rol = data.rol || 'cliente';
    }

    this.persistirEstado(usuario, this.rol);

    this._estaLogueado$.next(true);
    this._rolUsuario$.next(this.rol);

    this.redirigirPorRol();
  } catch (error) {
    console.error('Error al iniciar sesión con correo', error);
    throw error;
  }
}



  async logout(): Promise<void> {
    await signOut(this.auth);
    this.usuarioActual = null;
    this.rol = null;
    this.limpiarPersistencia();
    this.router.navigate(['/login']);

    this._estaLogueado$.next(false);
    this._rolUsuario$.next(null);

  }

  estaAutenticado(): boolean {
    return !!this.rol && !!this.usuarioActual;
  }

  getRol(): UsuarioData['rol'] {
    return this.rol;
  }

  getUsuario(): { uid: string; email: string | null; displayName: string | null } | null {
    return this.usuarioActual;
  }

  private persistirEstado(usuario: { uid: string; email: string | null; displayName: string | null }, rol: UsuarioData['rol']): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('rol', rol || '');
  }

  private limpiarPersistencia(): void {
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
  }

  private redirigirPorRol(): void {

    if (!this.rol) {
      this.router.navigate(['/login']);
      return;
    }

    const rutasPorRol = {
      'admin': '/admin/dashboard',
      'cliente': '/pedidos',
      'repartidor': '/repartidor',
      null: '/login'
    };

    this.router.navigate([rutasPorRol[this.rol]]);
  }

  obtenerUsuarioActual(): Observable<UsuarioData | null> {
  return new Observable((observer) => {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const docRef = doc(this.firestore, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UsuarioData;
          observer.next(data);
        } else {
          observer.next(null);
        }
      } else {
        observer.next(null);
      }
    });
  });
}

}
