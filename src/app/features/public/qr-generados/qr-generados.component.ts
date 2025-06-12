//Importacion de los modulos y servicios necesarios para el componente
import { Component, OnInit } from '@angular/core';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import {
  ClienteService,
  Cliente,
} from '../../../core/services/cliente.service'; // Ajusta la ruta
import { CommonModule } from '@angular/common';
import { QrGeneratorComponent } from '../../../shared/qr-generator/qr-generator.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-qr-generados',
  imports: [CommonModule, QrGeneratorComponent, CapitalizePipe],
  standalone: true,
  templateUrl: './qr-generados.component.html',
  styleUrls: ['./qr-generados.component.css'],
})
export class QrGeneradosComponent implements OnInit {
  //Arreglo que almacena los clientes obtenidos del servicio
  clientes: Cliente[] = [];

  constructor(
    private clienteService: ClienteService,
    private router: Router,
  ) {}


  //Metodo para anvegar a la ruta del registro de clientes
  irARegistro() {
    this.router.navigate(['/registro-cliente']);
  }

  //Metodo para eliminar un cliente y su QR asociado
  eliminarQr(clienteId: string) {
    //Confirmacion para evitar borrados accidentales
    if (confirm('¿Estás seguro de eliminar este QR?')) {
      this.clienteService
        .eliminarCliente(clienteId)// Lama al servicio para eliminar cliente por ID
        .then(() => {
          //Si la eliminacion es exitosa, filtra el arreglo para actualizar la vista sin el cliente eliminado
          this.clientes = this.clientes.filter((c) => c.id !== clienteId);
        })
        .catch((err) => console.error('Error al eliminar:', err));// Manejo basico de errores
    }
  }

  //Hook del ciclo de vida que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Suscripcion al observable que devuelve la lista recibida al arreglo local para mostrar en la vista
    this.clienteService.obtenerClientes().subscribe((clientes) => {
      this.clientes = clientes;
    });
  }
}
