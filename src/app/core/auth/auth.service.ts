import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private autenticado = false;
  private rol: 'admin' | 'cliente' | 'repartidor' | null = null;

  constructor(private router: Router) {
    const rolGuardado = localStorage.getItem('rol') as 'admin' | 'cliente' | 'repartidor' | null;
    if (rolGuardado) {
      this.rol = rolGuardado;
      this.autenticado = true;
    }
  }

  login(rol: 'admin' | 'cliente' | 'repartidor', usuario: any) {
    this.autenticado = true;
    this.rol = rol;
    localStorage.setItem('rol', rol);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  logout() {
    this.autenticado = false;
    this.rol = null;
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('rol');
  }

  getRol(): 'admin' | 'cliente' | 'repartidor' | null {
    return localStorage.getItem('rol') as 'admin' | 'cliente' | 'repartidor' | null;
  }

  getUsuario(): any {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

}
