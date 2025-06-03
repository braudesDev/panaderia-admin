import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signOut, User, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

interface UsuarioData {
  correo?: string;
  rol: 'admin' | 'cliente' | 'repartidor' | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioActual: User | null = null;
  private rol: 'admin' | 'cliente' | 'repartidor' | null = null;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.cargarEstadoPersistido();
  }

  private cargarEstadoPersistido(): void {
    const rolGuardado = localStorage.getItem('rol') as UsuarioData['rol'];
    if (rolGuardado) {
      this.rol = rolGuardado;
      const usuarioGuardado = localStorage.getItem('usuario');
      this.usuarioActual = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    }
  }

  async loginConGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const usuario = result.user;
      //Obtener el ID del usuario
      // console.log('UID del usuario:', usuario.uid);

      this.usuarioActual = usuario;

      // Referencia al documento en Firestore
      const docRef = doc(this.firestore, 'usuarios', usuario.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Crear el documento para el usuario nuevo sin rol asignado
        await setDoc(docRef, {
          correo: usuario.email,
          rol: 'cliente'
        });
        // Ya no es necesario el alert ni el logout aquí
        this.rol = 'cliente'; // Asignar rol por defecto
        this.persistirEstado(usuario, this.rol);
        this.redirigirPorRol();
        return;
      }

      const data = docSnap.data() as UsuarioData;
      this.rol = data.rol;

      if (!this.rol) {
      // Asignar cliente si rol es null o indefinido para evitar bloquear acceso
        this.rol = 'cliente';
        this.persistirEstado(usuario, this.rol);
        this.redirigirPorRol();
        return;
      }

      // Guardar info en localStorage
      this.persistirEstado(usuario, this.rol);
      // Redirigir según rol
      this.redirigirPorRol();

    } catch (error) {
      console.error('Error en login con Google', error);
      throw error; // Propaga el error para manejo en el componente
    }

  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.usuarioActual = null;
    this.rol = null;
    this.limpiarPersistencia();
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.rol && !!this.usuarioActual;
  }

  getRol(): UsuarioData['rol'] {
    return this.rol;
  }

  getUsuario(): User | null {
    return this.usuarioActual;
  }

  private persistirEstado(usuario: User, rol: UsuarioData['rol']): void {
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
      'repartidor': '/repartidor'
    };

    this.router.navigate([rutasPorRol[this.rol]]);
  }
}
