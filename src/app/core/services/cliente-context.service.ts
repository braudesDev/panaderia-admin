import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from './cliente.service'; // Asegúrate de que el path sea correcto

@Injectable({
  providedIn: 'root'
})
export class ClienteContextService {
  private clienteActualSubject = new BehaviorSubject<Cliente | null>(null);
  clienteActual$ = this.clienteActualSubject.asObservable();

  establecerCliente(cliente: Cliente) {
    this.clienteActualSubject.next(cliente);
  }

  limpiarCliente() {
    this.clienteActualSubject.next(null);
  }

  obtenerClienteActual(): Cliente | null {
    return this.clienteActualSubject.value;
  }
}
