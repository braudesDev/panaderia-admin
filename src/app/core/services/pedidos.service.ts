import { Injectable } from '@angular/core';

export interface Pedido {
  cliente: string;
  tiras: number;
  fecha: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private storageKey = 'pedidos';

  obtenerPedidos(): Pedido[] {
    const pedidosJSON = localStorage.getItem(this.storageKey);
    return pedidosJSON ? JSON.parse(pedidosJSON) : [];
  }

  guardarPedido(pedido: Pedido): void {
    const pedidos = this.obtenerPedidos();
    pedidos.push(pedido);
    localStorage.setItem(this.storageKey, JSON.stringify(pedidos));
  }

  eliminarPedido(index: number): void {
    const pedidos = this.obtenerPedidos();
    pedidos.splice(index, 1);
    localStorage.setItem(this.storageKey, JSON.stringify(pedidos));
  }

  // Puedes agregar métodos para editar o actualizar pedidos aquí si quieres
}
