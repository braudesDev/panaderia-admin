import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { ClienteService, Cliente } from '../../../core/services/cliente.service'; // Ajusta la ruta
import { CommonModule } from '@angular/common';
import { QrGeneratorComponent } from '../../../shared/qr-generator/qr-generator.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-qr-generados',
  imports: [CommonModule, QrGeneratorComponent, CapitalizePipe],
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

eliminarQr(clienteId: string) {
  if (confirm('¿Estás seguro de eliminar este QR?')) {
    this.clienteService.eliminarCliente(clienteId)
      .then(() => {
        this.clientes = this.clientes.filter(c => c.id !== clienteId);
      })
      .catch(err => console.error('Error al eliminar:', err));
  }
}

  ngOnInit(): void {
    this.clienteService.obtenerClientes().subscribe(clientes => {
      this.clientes = clientes;
    });
  }
}
