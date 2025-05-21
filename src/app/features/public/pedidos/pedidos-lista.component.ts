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
    private authService: AuthService
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

  eliminar(id: string): void {
    if (this.rolUsuario === 'admin') {
      this.pedidoService.eliminarPedido(id);
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
