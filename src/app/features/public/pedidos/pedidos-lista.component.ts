import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.css']
})

  export class PedidosListaComponent {
  pedidos: Pedido[] = [];

  constructor(private pedidoService: PedidoService) {
    this.pedidos = this.pedidoService.obtenerPedidos();
  }

  eliminar(index: number) {
    this.pedidoService.eliminarPedido(index);
    this.pedidos = this.pedidoService.obtenerPedidos(); // Actualiza lista
  }

}
