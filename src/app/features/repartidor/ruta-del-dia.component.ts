import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScannerQrComponent } from '../../shared/qr-scanner/scanner-qr/scanner-qr.component';
import { RutaService } from '../../core/services/ruta.service';

export interface RegistroDeRuta {
  clienteId: string;
  fecha: string;
  entregaInicial: number;
  entregaExtra: number;
  tirasVendidas: number;
  tirasSobrantes: number;
  cobroTotal: number;
}

@Component({
    selector: 'app-ruta-del-dia',
    standalone: true,
    templateUrl: './ruta-del-dia.component.html',
    styleUrls: ['./ruta-del-dia.component.css'],
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ScannerQrComponent,
        MatSnackBarModule // ✔ Módulo necesario (NO el servicio)
    ]
})
export class RutaDelDiaComponent {
  constructor(
    private snackBar: MatSnackBar,
    private rutaService: RutaService
  ) {} // ✔ Servicio inyectado

  precioPorTira = 10;

  tiendas = [
    { clienteId: 'cliente1', tienda: 'Limon San Cayetano', direccion: 'Calle 5 #123', hora: '08:30 AM' },
    { clienteId: 'cliente2', tienda: 'Limon El Encanto', direccion: 'Av. Juárez #456', hora: '09:15 AM' },
    { clienteId: 'cliente3', tienda: 'Ramon', direccion: 'Blvd. Díaz Ordaz #789', hora: '10:00 AM' }
  ];

  registrosRuta: RegistroDeRuta[] = [
    {
      clienteId: 'cliente1',
      fecha: new Date().toISOString().split('T')[0],
      entregaInicial: 50,
      entregaExtra: 0,
      tirasVendidas: 0,
      tirasSobrantes: 0,
      cobroTotal: 0
    },
        {
      clienteId: 'cliente2',
      fecha: '2025-05-20',
      entregaInicial: 30,
      entregaExtra: 0,
      tirasVendidas: 0,
      tirasSobrantes: 0,
      cobroTotal: 0
    },
    {
      clienteId: 'cliente3',
      fecha: '2025-05-20',
      entregaInicial: 40,
      entregaExtra: 0,
      tirasVendidas: 0,
      tirasSobrantes: 0,
      cobroTotal: 0
    }
  ];

  clienteActual: RegistroDeRuta | null = null;

  // Métodos corregidos
async registrarEntregas() {
  try {
    for (const registro of this.registrosRuta) {
      this.actualizarCobroTotal(registro);
      await this.rutaService.guardarRegistro(registro);
    }

    this.snackBar.open('✅ Entregas guardadas en Firestore', 'Cerrar', { duration: 3000 });
  } catch (error) {
    this.snackBar.open('❌ Error al guardar entregas', 'Cerrar', { duration: 3000 });
    console.error('Error al guardar en Firestore:', error);
  }
}


  calcularTirasVendidas(registro: RegistroDeRuta): number {
    return registro.entregaInicial + registro.entregaExtra - registro.tirasSobrantes;
  }

actualizarCobroTotal(registro: RegistroDeRuta) {
  // Validación añadida
  registro.entregaInicial = Math.max(0, registro.entregaInicial || 0);
  registro.entregaExtra = Math.max(0, registro.entregaExtra || 0);
  registro.tirasSobrantes = Math.max(0, registro.tirasSobrantes || 0);

  registro.tirasVendidas = this.calcularTirasVendidas(registro);
  registro.cobroTotal = registro.tirasVendidas * this.precioPorTira;
}

  procesarQr(clienteId: string) {
    this.clienteActual = this.registrosRuta.find(r => r.clienteId === clienteId) || null;
    if (!this.clienteActual) {
      this.snackBar.open('⚠️ Cliente no encontrado', 'Cerrar', { duration: 3000 });
    }
  }
}
