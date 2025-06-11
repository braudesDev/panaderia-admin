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
    MatTabsModule,
  ],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.css'],
})
export class PedidosListaComponent implements OnInit, OnDestroy {
  //Lista completa de pedidos recibidos del servicio
  pedidos: Pedido[] = [];

  // Pedidos con decha actual (para mostrar como "de hoy")
  pedidosDeHoy: Pedido[] = [];

  //Pedidos anteriores a la fecha actual
  pedidosHistoricos: Pedido[] = [];

  //Cadena de busqueda para filtrar por cliente
  filtro = '';

  //Rol de usuario actual (admin o repartidor)
  rolUsuario: string | null = null;

  //Suscripcion al observable de pedidos
  private sub: Subscription = new Subscription();

  //Paginacion para historicos
  paginaActual = 1;
  itemsPorPagina = 10; // Se puede ajustar según sea necesario

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Obtener rol de usuario
    this.rolUsuario = this.authService.getRol();

    //Suscribirse al stream de pedidos
    this.sub = this.pedidoService.obtenerPedidos().subscribe((pedidos) => {
      this.pedidos = pedidos;


      const hoy = new Date().toISOString().slice(0, 10);

      //Filtrar pedidos del dia actual
      this.pedidosDeHoy = pedidos.filter((p) => p.fecha === hoy);

      //filtrar pedidos anteriores y ordenarlso descendente
      this.pedidosHistoricos = pedidos
        .filter((p) => p.fecha !== hoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)); // ← Ordena por fecha descendente
    });
  }

  /**
   * Muestra una alerta para confirmar la condicion de un pedido.
   * Si se confirma, establece el pedido en el servicio y navega al registro
   */
  editarPedido(pedido: Pedido) {
    Swal.fire({
      title: '¿Editar pedido?',
      text: '¿Estás seguro que quieres editar este pedido?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.establecerPedidoParaEditar(pedido);
        this.router.navigate(['/repartidor/registrar-pedido']);
      }
    });
  }

  //Elimina un pedido si el usuario es admin y confirma la accion
  eliminar(id: string): void {
    if (this.rolUsuario === 'admin') {
      Swal.fire({
        title: '¿Eliminar pedido?',
        text: 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este pedido?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.pedidoService.eliminarPedido(id);
          Swal.fire('Eliminado', 'Pedido eliminado correctamente.', 'success');
        }
      });
    }
  }

  //Actualiza los datos del pedido en Firestore con los valores actuales
  async actualizarPedido(id: string) {
    const pedido = this.pedidos.find((p) => p.id === id);
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
        notas: pedido.notas,
      });
      alert('Pedido actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      alert('Hubo un error al actualizar el pedido.');
    }
  }

  //Alterna la visibilidad de los detalles extendidos del pedido
  toggleDetalles(pedido: Pedido & { mostrarDetalles?: boolean }): void {
    pedido.mostrarDetalles = !pedido.mostrarDetalles;
  }

  //Cancelar la suscripcion al destruir el componente
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Extiende el tipo de pedido para permitir propiedades dinamicas como 'mostrarDetalles'
   */
  get pedidosConDetalles() {
    return this.pedidos as (Pedido & { mostrarDetalles?: boolean })[];
  }

  /**
   * Calcula el total de paginas para la paginacion de pedidos historicos
   */
  get totalPaginas(): number {
    return Math.ceil(this.pedidosHistoricos.length / this.itemsPorPagina);
  }

  /**
   * Retorna el subconjunto de pedidos historicos correspondiente a la pagina actual.
   */
  get pedidosHistoricosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.pedidosHistoricos.slice(inicio, inicio + this.itemsPorPagina);
  }
}
