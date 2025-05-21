import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  imports: [CommonModule, QRCodeComponent, FormsModule],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent implements OnInit {

    qrData = '';

    ngOnInit(): void {
      this.qrData = crypto.randomUUID();
    }

cliente = {
  nombre: '',
  telefono: '',
  id: ''
};

registrarCliente() {
  this.cliente.id = crypto.randomUUID();
  console.log('Cliente registrado con ID:', this.cliente);
  this.qrData = this.cliente.id;
}


}
