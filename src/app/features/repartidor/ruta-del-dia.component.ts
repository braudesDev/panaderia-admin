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
import { ClienteContextService } from '../../core/services/cliente-context.service';
export interface RegistroDeRuta {
  clienteId: string;
  clienteNombre: string;
  clienteDireccion: string;
  fecha: string;
  entregaInicial: number | null;
  entregasExtras: (number | null) [];
  tirasVendidas: number;
  tirasSobrantes: number | null;
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
    private snackBar: MatSnackBar,
    private clienteContext: ClienteContextService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
  this.isLoading = true;
  try {
    const clientes = await firstValueFrom(this.clienteService.obtenerClientes());

    this.tiendas = clientes.map(cliente => ({
      clienteId: cliente.id!, // Usamos ! porque sabemos que collectionData lo añade
      tienda: cliente.nombre,
      direccion: cliente.direccion,
      hora: '08:00 AM'
    }));

    this.registrosRuta = clientes.map(cliente => ({
      clienteId: cliente.id!,
      clienteNombre: cliente.nombre,
      clienteDireccion: cliente.direccion,
      fecha: new Date().toISOString().split('T')[0],
      entregaInicial: 0,
      entregasExtras: [],
      tirasVendidas: 0,
      tirasSobrantes: 0,
      cobroTotal: 0
    }));

  } catch (error) {
    this.manejarError(error, 'Error al cargar clientes');
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
        entregaExtra: registro.entregasExtras || 0,
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

    // 🔍 Filtrar registros con datos reales
    const registrosValidos = this.registrosRuta.filter(r => this.registroTieneDatos(r));

    if (registrosValidos.length === 0) {
      this.snackBar.open('⚠️ No hay entregas para guardar', 'Cerrar', { duration: 3000 });
      return;
    }

    await Promise.all(registrosValidos.map(async registro => {
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



    // Agrega este método en tu componente
  private registroTieneDatos(registro: RegistroDeRuta): boolean {
    const sumaExtras = (registro.entregasExtras ?? []).reduce<number>((sum, val) => sum + (val ?? 0), 0);
    return (
      (registro.entregaInicial ?? 0) > 0 ||
      sumaExtras > 0 ||
      (registro.tirasSobrantes ?? 0) > 0
    );
  }


  trackByIndex(index: number, item: any): number {
    return index;
  }



  private manejarError(error: any, mensajePersonalizado?: string): void {
    const mensaje = mensajePersonalizado || error.message || 'Ocurrió un error';
    console.error(mensaje, error);

    this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
  }

    agregarEntregasExtras(registro: RegistroDeRuta) {
    registro.entregasExtras.push(null);
  }

    calcularTirasVendidas(registro: RegistroDeRuta): number {
    const sumaExtras = (registro.entregasExtras ?? []).reduce<number>((sum, val) => sum + (val ?? 0), 0);
    return (registro.entregaInicial ?? 0) + sumaExtras - (registro.tirasSobrantes ?? 0);
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
  registro.entregaInicial = Math.max(0, registro.entregaInicial ?? 0);
  registro.entregasExtras = registro.entregasExtras?.map(e => Math.max(0, e ?? 0)) ?? [];
  registro.tirasSobrantes = Math.max(0, registro.tirasSobrantes ?? 0);

  registro.tirasVendidas = this.calcularTirasVendidas(registro);
  registro.cobroTotal = registro.tirasVendidas * this.precioPorTira;
}


  async procesarQr(clienteId: string) {
    console.log('🔍 Cliente ID recibido desde el QR:', clienteId);
    this.clienteActual = this.registrosRuta.find(r => r.clienteId === clienteId) || null;

    if (!this.clienteActual) {
      await this.cargarDatosIniciales();
      this.clienteActual = this.registrosRuta.find(r => r.clienteId === clienteId) || null;

      if (!this.clienteActual) {
        console.warn('⚠️ Cliente no encontrado incluso después de recargar:', clienteId);
        this.snackBar.open('⚠️ Cliente no encontrado', 'Cerrar', { duration: 3000 });
        return;
      }
    }

    const cliente = await this.clienteService.obtenerClientePorId(clienteId);
    if (cliente) {
      this.clienteContext.establecerCliente(cliente);
      console.log('✅ Cliente establecido en el contexto:', cliente);
    }
  }
}
