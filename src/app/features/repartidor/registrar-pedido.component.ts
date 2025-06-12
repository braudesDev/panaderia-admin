//Importaciones necesarias de Angualr, Angular Material y servicios propios
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
import Swal from 'sweetalert2'; // Libreria para mostrar alertas

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
  //Permite establecer el modo de uso del componente ('admin', 'repartidor', 'cliente')
  @Input() modo?: 'admin' | 'repartidor' | 'cliente'; // Si no se recibe, se asigna según el rol del usuario

  //Objeto que contiene los datos del nuevo pedido
  nuevoPedido: Pedido;

  constructor(
    private pedidoService: PedidoService, //Gestiona que gestiona los pedidos
    private authService: AuthService, //Servicio que proporciona el rol del usuario
  ) {
    // Si no se recibe un modo externo, se asigna el modo automaticamente segun el rol del usuario autenticado
    const rol = this.authService.getRol();
    if (
      !this.modo &&
      (rol === 'admin' || rol === 'repartidor' || rol === 'cliente')
    ) {
      this.modo = rol;
    }

    //Inicializa el pedido vacio, o carga uno que este en edicion (por ejemplo desde un clic en "editar")
    this.nuevoPedido = this.crearPedidoVacio();
    const pedidoEditando = this.pedidoService.obtenerPedidoParaEditar();
    this.nuevoPedido = pedidoEditando
      ? { ...pedidoEditando } //Clon del pedido existente
      : this.crearPedidoVacio(); // Si no hay, uno nuevo vacio
  }

  //Crea un objeto Pedido con valores por defecto, usando la fecha y hora actuales
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

  //Metodo principal para guardar un pedido (nuevo o editado)
  async guardar() {
    //Validacion basica de campos obligatorios
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
      //Si el pedido ya tiene un ID significa que estamos editando
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
        // Si no hay ID, es nuevo pedido
        await this.pedidoService.guardarPedido(this.nuevoPedido);
        Swal.fire({
          icon: 'success',
          title: 'Pedido guardado',
          text: 'El pedido se ha guardado correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      //Limpiar el buffer de pedido editando, y reinicia el formulario
      this.pedidoService.limpiarPedidoEditando(); // Limpiamos el buffer
      this.nuevoPedido = this.crearPedidoVacio();
    } catch (error) {
      //En caso de error en la red o el servidor
      console.error('Error al guardar el pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Ha ocurrido un error al guardar el pedido. Por favor, inténtalo de nuevo más tarde.',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  //Metodo que limpia el formulario si guardar nada
  cancelar() {
    this.nuevoPedido = this.crearPedidoVacio();
  }

  //Metodo opcional para controlar acceso a rutas desde el componente (no muy comun aqui, pero incluido)
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesPermitidos = route.data['roles'];
    const rolUsuario = this.authService.getRol();
    return rolesPermitidos.includes(rolUsuario);
  }
}
