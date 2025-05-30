import { Component, OnInit } from '@angular/core';
import { ClienteService, Cliente } from '../../../core/services/cliente.service'; // Ajusta la ruta
import { CommonModule } from '@angular/common';
import { QrGeneratorComponent } from '../../../shared/qr-generator/qr-generator.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-qr-generados',
  imports: [CommonModule, QrGeneratorComponent],
  standalone: true,
  templateUrl: './qr-generados.component.html',
  styleUrls: ['./qr-generados.component.css']
})
export class QrGeneradosComponent implements OnInit {
   clientes: Cliente[] = [];

  constructor(private clienteService: ClienteService, private router: Router) {}

  irARegistro() {
  this.router.navigate(['/registro-cliente']);
}

  ngOnInit(): void {
    this.clienteService.obtenerClientes().subscribe(clientes => {
      this.clientes = clientes;
    });
  }
}
