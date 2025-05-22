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
    ClienteFiltroPipe
  ],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.css']
})


export class PedidosListaComponent implements OnInit, OnDestroy {
editar(_t22: Pedido) {
throw new Error('Method not implemented.');
}
  pedidos: (Pedido & { mostrarDetalles?: boolean })[] = [];
  rolUsuario: string | null = null;
  filtro: string = '';
  private sub: Subscription = new Subscription();

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.authService.getRol();

    this.sub = this.pedidoService.obtenerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos.map(p => ({
        ...p,
        mostrarDetalles: false
      }));
    });
  }


editarPedido(pedido: Pedido) {
  console.log('Editando pedido:', pedido);
  this.pedidoService.establecerPedidoParaEditar(pedido);
  this.router.navigate(['/repartidor/registrar-pedido']);
}


  eliminar(id: string): void {
    if (this.rolUsuario === 'admin') {
      const confirmar =  confirm( 'Estas seguro que quieres eliminar este pedido?');
      if (confirmar) {
        this.pedidoService.eliminarPedido(id);
        alert('Pedido eliminado correctamente.')
      }
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
}
