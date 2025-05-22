import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScannerQrComponent } from '../../shared/qr-scanner/scanner-qr/scanner-qr.component';
import { RutaService } from '../../core/services/ruta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface RegistroDeRuta {
  clienteId: string;
  clienteNombre: string;
  clienteDireccion: string;
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class RutaDelDiaComponent implements OnInit {
  precioPorTira = 10;
  tiendas: any[] = [];
  registrosRuta: RegistroDeRuta[] = [];
  clienteActual: RegistroDeRuta | null = null;
  isLoading = false;

  constructor(
    private rutaService: RutaService,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
  this.isLoading = true;
  try {
    const clientes = await firstValueFrom(this.clienteService.obtenerClientes());

    // Sincroniza tiendas y registrosRuta
    this.tiendas = clientes.map(cliente => ({
      clienteId: cliente.id,
      tienda: cliente.nombre,
      direccion: cliente.direccion,
      hora: '08:00 AM'
    }));

    this.registrosRuta = clientes.map(cliente => ({
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteDireccion: cliente.direccion,
      fecha: new Date().toISOString().split('T')[0],
      entregaInicial: 0,
      entregaExtra: 0,
      tirasVendidas: 0,
      tirasSobrantes: 0,
      cobroTotal: 0
    }));

    await this.cargarRegistros();
  } catch (error) {
    this.manejarError(error, 'Error al cargar datos iniciales');
  } finally {
    this.isLoading = false;
  }
}

  async cargarRegistros(): Promise<void> {
    this.isLoading = true;
    try {
      const [registros, clientes] = await Promise.all([
        firstValueFrom(this.rutaService.obtenerRegistros()),
        firstValueFrom(this.clienteService.obtenerClientes())
      ]);

      const clientesMap = new Map(clientes.map(c => [c.id, c]));

      this.registrosRuta = registros.map(registro => ({
        ...registro,
        clienteNombre: clientesMap.get(registro.clienteId)?.nombre || 'Desconocido',
        clienteDireccion: clientesMap.get(registro.clienteId)?.direccion || 'Sin dirección',
        entregaInicial: registro.entregaInicial || 0,
        entregaExtra: registro.entregaExtra || 0,
        tirasSobrantes: registro.tirasSobrantes || 0
      })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    } catch (error) {
      this.manejarError(error, 'Error al cargar registros');
    } finally {
      this.isLoading = false;
    }
  }

  async registrarEntregas() {
    this.isLoading = true;
    try {
      const clientes = await firstValueFrom(this.clienteService.obtenerClientes());

      await Promise.all(this.registrosRuta.map(async registro => {
        this.actualizarCobroTotal(registro);

        const cliente = clientes.find(c => c.id === registro.clienteId);
        if (!cliente) return;

        await this.rutaService.guardarRegistro({
          ...registro,
          clienteNombre: cliente.nombre,
          clienteDireccion: cliente.direccion
        });
      }));

      this.snackBar.open('✅ Entregas guardadas correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.manejarError(error, 'Error al guardar entregas');
    } finally {
      this.isLoading = false;
    }
  }

  private manejarError(error: any, mensajePersonalizado?: string): void {
    const mensaje = mensajePersonalizado || error.message || 'Ocurrió un error';
    console.error(mensaje, error);

    this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
  }

  calcularTirasVendidas(registro: RegistroDeRuta): number {
    return registro.entregaInicial + registro.entregaExtra - registro.tirasSobrantes;
  }

  // Método para encontrar registro por clienteId
getRegistro(clienteId: string): RegistroDeRuta | undefined {
  return this.registrosRuta.find(r => r.clienteId === clienteId);
}

// TrackBy para optimizar rendimiento
trackByClienteId(index: number, tienda: any): string {
  return tienda.clienteId;
}

  actualizarCobroTotal(registro: RegistroDeRuta) {
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
