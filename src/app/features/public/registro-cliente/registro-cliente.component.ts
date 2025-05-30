import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente, ClienteService } from '../../../core/services/cliente.service';
import { QrGeneratorComponent } from '../../../shared/qr-generator/qr-generator.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, QrGeneratorComponent],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.css']
})
export class RegistroClienteComponent implements OnInit {

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  cliente = {
    nombre: '',
    telefono: '',
    id: '',
    direccion: '',
  };

  qrGenerado = false;
  qrId = '';
  clientes: Cliente[] = [];
  mostrarQrs = false;

  registrarCliente() {
    this.cliente.id = crypto.randomUUID();
    const clienteAGuardar = { ...this.cliente };

    this.clienteService.guardarCliente(clienteAGuardar)
      .then(() => {
        this.qrGenerado = true;
        this.qrId = this.cliente.id;
        console.log('Cliente guardado');
        this.cargarClientes(); // Recarga la lista de clientes
      })
      .catch(err => console.error('Error al guardar:', err));
  }

  limpiarFormulario() {
    this.cliente = {
      nombre: '',
      telefono: '',
      id: '',
      direccion: ''
    };
    this.qrGenerado = false;
  }

  cargarClientes() {
    this.clienteService.obtenerClientes().subscribe(clientes => {
      this.clientes = clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

irAQrsGenerados() {
  this.router.navigate(['/qr-generados']);
}

  ngOnInit() {
    this.cargarClientes();
  }
}
