import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from './cliente.service';
import { User } from '@angular/fire/auth'; // Importa el tipo User de Firebase
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ClienteContextService {
  private clienteActualSubject = new BehaviorSubject<Cliente | null>(null);
  private usuarioActualSubject = new BehaviorSubject<User | null>(null);

  clienteActual$ = this.clienteActualSubject.asObservable();
  usuarioActual$ = this.usuarioActualSubject.asObservable();

  // Métodos para cliente
  establecerCliente(cliente: Cliente) {
    this.clienteActualSubject.next(cliente);
  }

  limpiarCliente() {
    this.clienteActualSubject.next(null);
  }

  obtenerClienteActual(): Cliente | null {
    return this.clienteActualSubject.value;
  }

  // Métodos para usuario
  establecerUsuario(usuario: User) {
    this.usuarioActualSubject.next(usuario);
  }

  limpiarUsuario() {
    this.usuarioActualSubject.next(null);
  }

  obtenerUsuarioActual(): User | null {
    return this.usuarioActualSubject.value;
  }
}
