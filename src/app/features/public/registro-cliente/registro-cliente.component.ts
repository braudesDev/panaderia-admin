import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.css']
})
export class RegistroClienteComponent {
  cliente = {
    nombre: '',
    telefono: '',
    id: ''
  };

  qrGenerado = false;

  registrarCliente() {
    this.cliente.id = crypto.randomUUID();
    this.qrGenerado = true;
    console.log('Cliente registrado:', this.cliente);
  }

  limpiarFormulario() {
    this.cliente = { nombre: '', telefono: '', id: '' };
    this.qrGenerado = false;
  }
}
