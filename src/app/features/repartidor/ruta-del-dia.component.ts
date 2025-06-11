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
import { SobrantesService } from '../../core/services/sobrantes-services.service';
import { RegistroSobrante } from '../../core/models/sobrante.model'; // ajusta la ruta según tu estructura
import Swal from 'sweetalert2';
import { AuthService } from '../../core/auth/auth.service';

export interface RegistroDeRuta {
  clienteId: string;
  clienteNombre: string;
  clienteDireccion: string;
  fecha: string;
  entregaInicial: number | null;
  entregasExtras: (number | null)[];
  tirasVendidas: number;
  tirasSobrantes: number | null;
  sobrantes?: number;
  cobroTotal: number;
  repartidorId?: string; // id del repartidor
  repartidorNombre?: string; // nombre del repartidor (opcional, para mostrar fácilmente)
  repartidorCorreo?: string; // correo del repartidor (opcional)
  porcentajeSobrantes?: number;
  sincronizado?: boolean;
  usuarioId?: string;
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
    MatProgressSpinnerModule,
  ],
})
export class RutaDelDiaComponent implements OnInit {
  entregasGuardadas = false;

  precioPorTira = 10;
  tiendas: any[] = [];
  registrosRuta: RegistroDeRuta[] = [];
  clienteActual: RegistroDeRuta | null = null;
  isLoading = false;
  autoSaved = false;

  constructor(
    private rutaService: RutaService,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    private clienteContext: ClienteContextService,
    private sobrantesService: SobrantesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const clave = this.obtenerClaveDelAlmacenamiento();
    const datosGuardados = localStorage.getItem(clave);

    if (datosGuardados) {
      this.registrosRuta = JSON.parse(datosGuardados).map((registro: any) => ({
        ...registro,
        sincronizado: registro.sincronizado === true, // Asegura que exista la propiedad
      }));
      this.tiendas = this.registrosRuta.map((registro) => ({
        clienteId: registro.clienteId,
        tienda: registro.clienteNombre,
        direccion: registro.clienteDireccion,
        hora: '08:00 AM',
      }));
    } else {
      this.cargarDatosIniciales();
    }
  }

  private obtenerFechaLocal(): string {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    const local = new Date(ahora.getTime() - offset);
    return local.toISOString().split('T')[0];
  }

  async cargarDatosIniciales() {
    this.isLoading = true;
    try {
      const clientes = await firstValueFrom(
        this.clienteService.obtenerClientes(),
      );

      this.tiendas = clientes.map((cliente) => ({
        clienteId: cliente.id!, // Usamos ! porque sabemos que collectionData lo añade
        tienda: cliente.nombre,
        direccion: cliente.direccion,
        hora: '08:00 AM',
      }));

      this.registrosRuta = clientes.map((cliente) => ({
        clienteId: cliente.id!,
        clienteNombre: cliente.nombre,
        clienteDireccion: cliente.direccion,
        fecha: this.obtenerFechaLocal(),
        entregaInicial: 0,
        entregasExtras: [],
        tirasVendidas: 0,
        tirasSobrantes: 0,
        cobroTotal: 0,
      }));
    } catch (error) {
      this.manejarError(error, 'Error al cargar clientes');
    } finally {
      this.isLoading = false;
    }
  }

  private obtenerClaveDelAlmacenamiento(): string {
    const fecha = this.obtenerFechaLocal();
    return `registroRuta-${fecha}`;
  }

  async cargarRegistros(): Promise<void> {
    this.isLoading = true;
    try {
      const [registros, clientes] = await Promise.all([
        firstValueFrom(this.rutaService.obtenerRegistros()),
        firstValueFrom(this.clienteService.obtenerClientes()),
      ]);

      const clientesMap = new Map(clientes.map((c) => [c.id, c]));

      this.registrosRuta = registros
        .map((registro) => ({
          ...registro,
          clienteNombre:
            clientesMap.get(registro.clienteId)?.nombre || 'Desconocido',
          clienteDireccion:
            clientesMap.get(registro.clienteId)?.direccion || 'Sin dirección',
          entregaInicial: registro.entregaInicial || 0,
          entregasExtras: registro.entregasExtras || 0,
          tirasSobrantes: registro.tirasSobrantes || 0,
        }))
        .sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
    } catch (error) {
      this.manejarError(error, 'Error al cargar registros');
    } finally {
      this.isLoading = false;
    }
  }

  //Boton registrar entregas
  async registrarEntregas() {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas registrar las entregas del día de hoy?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
    });

    if (!resultado.isConfirmed) return;

    this.isLoading = true;

    try {
      const clientes = await firstValueFrom(
        this.clienteService.obtenerClientes(),
      );
      const registrosValidos = this.registrosRuta.filter((r) =>
        this.registroTieneDatos(r),
      );

      if (registrosValidos.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No hay entregas para registrar',
          text: 'No hay entregas registradas para el día de hoy.',
          confirmButtonText: 'Cerrar',
        });
        return;
      }

      const usuario = this.authService.getUsuario();

      if (!usuario) {
        await Swal.fire({
          icon: 'error',
          title: 'Usuario no autenticado',
          text: 'No se pudo obtener la información del usuario actual.',
          confirmButtonText: 'Cerrar',
        });
        return;
      }

      const usuarioActualId =
        this.clienteContext.obtenerUsuarioActual()?.uid || usuario.uid;
      const usuarioNombre = usuario.displayName ?? 'Sin nombre';
      let guardados = 0;

      for (const registro of registrosValidos) {
        registro.usuarioId ??= usuarioActualId;
        registro.repartidorId ??= usuarioActualId;
        registro.repartidorNombre ??= usuarioNombre;

        this.actualizarCobroTotal(registro);
        registro.porcentajeSobrantes =
          this.calcularPorcentajeSobrantes(registro);

        const cliente = clientes.find((c) => c.id === registro.clienteId);
        if (!cliente) continue;

        if (registro.sincronizado === true) continue;
        if (!registro.usuarioId) {
          console.warn('⚠️ Registro sin usuarioId, se omitirá:', registro);
          continue;
        }

        const yaExiste = await this.rutaService.verificarRegistroExistente(
          registro.clienteId,
          registro.fecha,
          registro.usuarioId,
        );
        if (yaExiste) {
          registro.sincronizado = true;
          continue;
        }

        // Guardar ruta del día
        await this.rutaService.guardarRegistro({
          ...registro,
          clienteNombre: cliente.nombre,
          clienteDireccion: cliente.direccion,
          usuarioId: registro.usuarioId,
          repartidorId: usuarioActualId,
        });

        // Guardar sobrantes
        const sobrante: RegistroSobrante = {
          clienteId: registro.clienteId,
          entregadas: registro.tirasVendidas,
          sobrantes: registro.tirasSobrantes ?? 0,
          porcentaje: registro.porcentajeSobrantes ?? 0,
          alerta: false,
          fecha: registro.fecha,
          sincronizado: true,
          repartidorId: usuarioActualId,
          repartidorNombre: usuarioNombre, // <- esto falta
        };

        await this.sobrantesService.guardarRegistro(sobrante);

        registro.sincronizado = true;
        guardados++;
      }

      if (guardados === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No hay nuevas entregas para registrar',
          text: 'Todos los registros ya fueron sincronizados previamente.',
          confirmButtonText: 'Cerrar',
        });
      } else {
        // Limpiar localStorage y notificar
        this.registrosRuta = this.registrosRuta.filter(
          (r) => !this.registroTieneDatos(r) || r.sincronizado,
        );
        localStorage.setItem(
          this.obtenerClaveDelAlmacenamiento(),
          JSON.stringify(this.registrosRuta),
        );
        this.entregasGuardadas = true;

        await Swal.fire({
          icon: 'success',
          title: 'Entregas Guardadas Correctamente',
          text: `${guardados} entregas guardadas correctamente.`,
          confirmButtonText: 'Cerrar',
        });
      }
    } catch (error: any) {
      console.error('Error detallado:', error);
      const mensajeError =
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar entregas',
        text: `Ocurrió un error al guardar las entregas: ${mensajeError}`,
        confirmButtonText: 'Cerrar',
      });
    } finally {
      this.isLoading = false;
    }
  }

  // Agrega este método en tu componente
  private registroTieneDatos(registro: RegistroDeRuta): boolean {
    const sumaExtras = (registro.entregasExtras ?? []).reduce<number>(
      (sum, val) => sum + (val ?? 0),
      0,
    );
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

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'Cerrar',
    });
  }

  agregarEntregasExtras(registro: RegistroDeRuta) {
    registro.entregasExtras.push(null);
    this.guardarEnLocalStorage();
  }

  calcularTirasVendidas(registro: RegistroDeRuta): number {
    const sumaExtras = (registro.entregasExtras ?? []).reduce<number>(
      (sum, val) => sum + (val ?? 0),
      0,
    );
    return (
      (registro.entregaInicial ?? 0) +
      sumaExtras -
      (registro.tirasSobrantes ?? 0)
    );
  }

  // Método para encontrar registro por clienteId
  getRegistro(clienteId: string): RegistroDeRuta | undefined {
    return this.registrosRuta.find((r) => r.clienteId === clienteId);
  }

  // TrackBy para optimizar rendimiento
  trackByClienteId(index: number, tienda: any): string {
    return tienda.clienteId;
  }

  actualizarCobroTotal(registro: RegistroDeRuta) {
    registro.entregaInicial = Math.max(0, registro.entregaInicial ?? 0);
    registro.entregasExtras =
      registro.entregasExtras?.map((e) => Math.max(0, e ?? 0)) ?? [];
    registro.tirasSobrantes = Math.max(0, registro.tirasSobrantes ?? 0);

    registro.tirasVendidas = this.calcularTirasVendidas(registro);
    registro.cobroTotal = registro.tirasVendidas * this.precioPorTira;
    this.guardarEnLocalStorage();
  }

  private calcularPorcentajeSobrantes(registro: RegistroDeRuta): number {
    const entregadas = registro.tirasVendidas;
    const sobrantes = registro.tirasSobrantes ?? 0;
    if (entregadas === 0) return 0;
    return (sobrantes / entregadas) * 100;
  }

  async procesarQr(clienteId: string) {
    console.log('🔍 Cliente ID recibido desde el QR:', clienteId);
    this.clienteActual =
      this.registrosRuta.find((r) => r.clienteId === clienteId) || null;

    // Solo recarga si no existe el cliente en los registros actuales
    if (!this.clienteActual) {
      await this.cargarDatosIniciales();
      this.clienteActual =
        this.registrosRuta.find((r) => r.clienteId === clienteId) || null;

      if (!this.clienteActual) {
        console.warn(
          '⚠️ Cliente no encontrado incluso después de recargar:',
          clienteId,
        );
        Swal.fire({
          icon: 'warning',
          title: 'Cliente no encontrado',
          text: 'No se encontró el cliente en los registros actuales. Por favor, verifica el ID del cliente.',
          confirmButtonText: 'Cerrar',
        });
        return;
      }
    }

    // Scroll suave a la tarjeta de la tienda encontrada
    setTimeout(() => {
      const el = document.getElementById('tienda-' + clienteId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);

    try {
      const cliente = await this.clienteService.obtenerClientePorId(clienteId);
      if (cliente) {
        this.clienteContext.establecerCliente(cliente);
        console.log('✅ Cliente establecido en el contexto:', cliente);

        // Guardado automático solo si hubo cambios
        this.guardarEnLocalStorage();
      } else {
        this.snackBar.open(
          '⚠️ No se encontró información del cliente',
          'Cerrar',
          { duration: 3000 },
        );
      }
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al obtener cliente',
        text: 'Ocurrio un error al obtener los datos del cliente. Por favor, intentalo de nuevo mas tarde.',
      });
    }
  }

  private guardarEnLocalStorage(): void {
    const clave = this.obtenerClaveDelAlmacenamiento();
    const datos = JSON.stringify(this.registrosRuta);

    try {
      localStorage.setItem(clave, datos);
      this.autoSaved = true;
      setTimeout(() => (this.autoSaved = false), 1200); // Oculta el icono después de 1.2s
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar localmente',
        text: 'Ocurrió un error al guardar los datos localmente. Por favor, inténtalo de nuevo más tarde.',
        confirmButtonText: 'Cerrar',
      });
    }
  }
}
