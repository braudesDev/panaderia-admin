import { MatCardModule } from '@angular/material/card';
import { Component, Input } from '@angular/core';
import { PedidoService, Pedido } from '../../core/services/pedidos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatDividerModule,
  ],
  templateUrl: './registrar-pedido.component.html',
  styleUrls: ['./registrar-pedido.component.css'],
})
export class RegistrarPedidoComponent {
  @Input() modo?: 'admin' | 'repartidor' | 'cliente'; // Si no se recibe, se asigna según el rol del usuario

  nuevoPedido: Pedido;

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
  ) {
    // Si no se recibe el input, lo asigna según el rol
    const rol = this.authService.getRol();
    if (
      !this.modo &&
      (rol === 'admin' || rol === 'repartidor' || rol === 'cliente')
    ) {
      this.modo = rol;
    }

    this.nuevoPedido = this.crearPedidoVacio();
    const pedidoEditando = this.pedidoService.obtenerPedidoParaEditar();
    this.nuevoPedido = pedidoEditando
      ? { ...pedidoEditando }
      : this.crearPedidoVacio();
  }

  private crearPedidoVacio(): Pedido {
    const now = new Date();
    return {
      cliente: '',
      tiras: 0,
      fecha: now.toISOString().slice(0, 10), // YYYY-MM-DD
      hora: now.toTimeString().slice(0, 5), // HH:MM
      notas: '',
      prioridad: '',
    };
  }

  async guardar() {
    if (!this.nuevoPedido.cliente.trim() || this.nuevoPedido.tiras <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor completa los campos obligatorios correctamente.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      if (this.nuevoPedido.id) {
        // Actualizar pedido existente
        await this.pedidoService.actualizarPedido(
          this.nuevoPedido.id,
          this.nuevoPedido,
        );
        Swal.fire({
          icon: 'success',
          title: 'Pedido actualizado',
          text: 'El pedido se ha actualizado correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Guardar nuevo pedido
        await this.pedidoService.guardarPedido(this.nuevoPedido);
        Swal.fire({
          icon: 'success',
          title: 'Pedido guardado',
          text: 'El pedido se ha guardado correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      this.pedidoService.limpiarPedidoEditando(); // Limpiamos el buffer
      this.nuevoPedido = this.crearPedidoVacio();
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Ha ocurrido un error al guardar el pedido. Por favor, inténtalo de nuevo más tarde.',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  cancelar() {
    this.nuevoPedido = this.crearPedidoVacio();
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesPermitidos = route.data['roles'];
    const rolUsuario = this.authService.getRol();
    return rolesPermitidos.includes(rolUsuario);
  }
}
