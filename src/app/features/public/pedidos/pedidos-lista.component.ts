import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../../../core/services/pedidos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ClienteFiltroPipe } from '../../../shared/pipes/cliente-filtro.pipe';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-pedidos-lista',
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    ClienteFiltroPipe,
    MatTabsModule
  ],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.css']
})


export class PedidosListaComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  pedidosDeHoy: Pedido[] = [];
  pedidosHistoricos: Pedido[] = [];
  filtro = '';
  rolUsuario: string | null = null;
  private sub: Subscription = new Subscription();
  paginaActual = 1;
  itemsPorPagina = 10; // Se puede ajustar según sea necesario

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.authService.getRol();
    this.sub = this.pedidoService.obtenerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;
      const hoy = new Date().toISOString().slice(0, 10);
      this.pedidosDeHoy = pedidos.filter(p => p.fecha === hoy);
      this.pedidosHistoricos = pedidos
        .filter(p => p.fecha !== hoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)); // ← Ordena por fecha descendente
    });
  }


editarPedido(pedido: Pedido) {
  Swal.fire({
    title: '¿Editar pedido?',
    text: '¿Estás seguro que quieres editar este pedido?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, editar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.pedidoService.establecerPedidoParaEditar(pedido);
      this.router.navigate(['/repartidor/registrar-pedido']);
    }
  });
}


  eliminar(id: string): void {
    if (this.rolUsuario === 'admin') {
      Swal.fire({
        title: '¿Eliminar pedido?',
        text: 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este pedido?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.pedidoService.eliminarPedido(id);
          Swal.fire('Eliminado', 'Pedido eliminado correctamente.', 'success');
        }
      });
    }
  }


async actualizarPedido(id: string) {
  const pedido = this.pedidos.find(p => p.id === id);
  if (!pedido) {
    alert('No se encontró el pedido.');
    return;
  }

  try {
    await this.pedidoService.actualizarPedido(id, {
      cliente: pedido.cliente,
      tiras: pedido.tiras,
      fecha: pedido.fecha,
      hora: pedido.hora,
      notas: pedido.notas
    });
    alert('Pedido actualizado correctamente.');
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    alert('Hubo un error al actualizar el pedido.');
  }
}


  toggleDetalles(pedido: Pedido & { mostrarDetalles?: boolean }): void {
    pedido.mostrarDetalles = !pedido.mostrarDetalles;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get pedidosConDetalles() {
    return this.pedidos as (Pedido & { mostrarDetalles?: boolean })[];
  }

  get totalPaginas (): number {
    return Math.ceil(this.pedidosHistoricos.length / this.itemsPorPagina);
  }

  get pedidosHistoricosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.pedidosHistoricos.slice(inicio, inicio + this.itemsPorPagina);
  }

}
