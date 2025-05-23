import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { Cliente, ClienteService } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.css']
})
export class RegistroClienteComponent {

  constructor(private clienteService: ClienteService) {}

  cliente = {
    nombre: '',
    telefono: '',
    id: '',
    direccion: '',
  };

  qrGenerado = false;

 registrarCliente() {
  this.cliente.id = crypto.randomUUID();

  const clienteAGuardar = {
    ...this.cliente,
  };

  this.clienteService.guardarCliente(clienteAGuardar)
    .then(() => {
      this.qrGenerado = true;
      console.log('Cliente guardado');
    })
    .catch(err => console.error('Error al guardar:', err));
}



limpiarFormulario() {
  this.cliente = {
    nombre: '',
    telefono: '',
    id: '',
    direccion: '' // ✅ ahora sí cumple con el tipo Cliente
  };
  this.qrGenerado = false;
}

}
