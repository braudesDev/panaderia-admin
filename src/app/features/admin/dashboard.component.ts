import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutaService } from '../../core/services/ruta.service';
import { RegistroDeRuta } from '../../features/repartidor/ruta-del-dia.component';
import { SobrantesService } from '../../core/services/sobrantes-services.service';
import { RegistroSobrante } from '../../core/models/sobrante.model';
import { ResumenAgrupado } from '../../core/models/resumen.model';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription, interval } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChartRef', { static: false, read: BaseChartDirective })
  barChart!: BaseChartDirective;
  @ViewChild('pieChartRef', { static: false, read: BaseChartDirective })
  pieChart!: BaseChartDirective;

  listaDeUsuarios: Usuario[] = []; // Aquí deberías cargar los usuarios desde tu servicio de usuarios

  registros: RegistroDeRuta[] = [];
  sobrantesOriginal: RegistroSobrante[] = [];
  sobrantes: RegistroSobrante[] = [];

  // Totales generales
  totalEntregadas: number = 0;
  totalSobrantes: number = 0;
  porcentajeSobrantes: number = 0;
  clientesEnAlerta: number = 0;

  // Resumenes por periodo
  resumenPorDia: ResumenAgrupado[] = [];
  resumenPorSemana: ResumenAgrupado[] = [];
  resumenPorMes: ResumenAgrupado[] = [];
  resumenPorAnio: ResumenAgrupado[] = [];

  // Seleccion de vista
  vistaSeleccionada: 'día' | 'semana' | 'mes' | 'año' = 'día';
  fechaSeleccionada: string = this.obtenerFechaHoy();

  // Configuración de gráficos
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Entregadas', data: [], backgroundColor: '#0CF2C4' },
      { label: 'Sobrantes', data: [], backgroundColor: '#F54301' },
    ],
  };

  paginacionPorPeriodo: Record<string, { pagina: number }> = {};
  itemsPorPaginaPeriodo = 10; // Ajustar según sea necesario

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'top' } },
  };

  pieChartData: ChartData<'doughnut'> = {
    labels: ['Clientes en alerta', 'Clientes normales'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#F40033', '#0CF231'],
      },
    ],
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  private refreshSubscription!: Subscription;

  constructor(
    private rutaService: RutaService,
    private sobranteService: SobrantesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.cargarRegistros();
    this.cargarSobrantes();
    this.authService.obtenerUsuarios().subscribe((usuarios) => {
      this.listaDeUsuarios = usuarios;
    });

    // Configurar intervalo de actualización (5 minutos)
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      const hoy = this.obtenerFechaHoy();
      if (hoy !== this.fechaSeleccionada) {
        this.fechaSeleccionada = hoy;
        this.vistaSeleccionada = 'día';
        this.cargarSobrantes();
      }
    });
  }

  ngAfterViewInit() {
    this.actualizarGraficas();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  cargarRegistros() {
    this.authService.obtenerUsuarios().subscribe((usuarios) => {
      this.listaDeUsuarios = usuarios;

      this.rutaService.obtenerRegistros().subscribe((data) => {
        this.registros = data.sort((a, b) => b.fecha.localeCompare(a.fecha));
      });
    });
  }

  cargarSobrantes() {
    this.sobranteService.obtenerTodos().subscribe((data) => {
      this.sobrantesOriginal = data.sort((a, b) =>
        b.fecha.localeCompare(a.fecha),
      );
      this.sobrantes = [...this.sobrantesOriginal];
      this.aplicarFiltroPorFecha();
      this.calcularResumen();

      this.calcularAlertas(this.sobrantesOriginal);

      this.resumenPorDia = this.agruparPorPeriodo('día');
      this.resumenPorSemana = this.agruparPorPeriodo('semana');
      this.resumenPorMes = this.agruparPorPeriodo('mes');
      this.resumenPorAnio = this.agruparPorPeriodo('año');

      this.actualizarGraficas();
    });
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  actualizarGraficas() {
    try {
      const resumenCompleto = this.resumenActual;
      let resumen: ResumenAgrupado[] = [];

      // Aplicar límite según la vista seleccionada
      switch (this.vistaSeleccionada) {
        case 'día':
          resumen = resumenCompleto.slice(-7); // Últimos 7 días
          break;
        case 'semana':
          resumen = resumenCompleto.slice(-4); // Últimas 4 semanas
          break;
        case 'mes':
          resumen = resumenCompleto.slice(-12); // Últimos 12 meses
          break;
        case 'año':
          resumen = resumenCompleto; // Mostrar todos los años disponibles
          break;
      }

      // Actualizar gráfica de barras
      this.barChartData = {
        labels: resumen.map((r) => r.periodo),
        datasets: [
          {
            label: 'Entregadas',
            data: resumen.map((r) => r.totalEntregadas),
            backgroundColor: '#0CF2C4',
          },
          {
            label: 'Sobrantes',
            data: resumen.map((r) => r.totalSobrantes),
            backgroundColor: '#F54301',
          },
        ],
      };

      // Actualizar gráfica de dona
      const totalClientes = this.sobrantes.length;
      const clientesEnAlerta = this.sobrantes.filter((s) => s.alerta).length;
      const clientesNormales = totalClientes - clientesEnAlerta;

      this.pieChartData = {
        labels: ['Clientes en alerta', 'Clientes normales'],
        datasets: [
          {
            data: [clientesEnAlerta, clientesNormales],
            backgroundColor: ['#F40033', '#0CF231'],
          },
        ],
      };

      // Forzar actualización de gráficas
      setTimeout(() => {
        this.barChart?.chart?.update();
        this.pieChart?.chart?.update();
      }, 0);
    } catch (error) {
      console.error('Error al actualizar gráficas:', error);
    }
  }

  aplicarFiltroPorFecha() {
    if (this.vistaSeleccionada === 'día') {
      this.sobrantes = this.sobrantesOriginal.filter(
        (s) => s.fecha === this.fechaSeleccionada,
      );
    } else {
      this.sobrantes = [...this.sobrantesOriginal];
    }
  }

  onFechaChange(nuevaFecha: string) {
    this.fechaSeleccionada = nuevaFecha;
    this.aplicarFiltroPorFecha();
    this.calcularResumen();
    this.actualizarGraficas();
  }

  onVistaChange() {
    this.aplicarFiltroPorFecha();
    this.calcularResumen();
    this.paginacionPorPeriodo = {}; // Reiniciar paginación al cambiar vista
    this.actualizarGraficas();
  }

  calcularPorcentaje(sobrantes: number, entregadas: number): string {
    return entregadas > 0 ? ((sobrantes / entregadas) * 100).toFixed(1) : '0';
  }

  calcularResumen() {
    const umbralAlerta = 20;

    this.totalEntregadas = this.sobrantes.reduce(
      (sum, r) => sum + r.entregadas,
      0,
    );
    this.totalSobrantes = this.sobrantes.reduce(
      (sum, r) => sum + r.sobrantes,
      0,
    );
    this.porcentajeSobrantes =
      this.totalEntregadas > 0
        ? +((this.totalSobrantes / this.totalEntregadas) * 100).toFixed(1)
        : 0;

    this.calcularAlertas(this.sobrantes);

    this.sobrantes.forEach((r) => {
      r.porcentaje =
        r.entregadas > 0 ? +((r.sobrantes / r.entregadas) * 100).toFixed(1) : 0;
      r.alerta = r.porcentaje > umbralAlerta;
    });

    this.clientesEnAlerta = this.sobrantes.filter((r) => r.alerta).length;
  }

  private obtenerSemanaISO(fecha: Date): number {
    const tempDate = new Date(fecha.getTime());
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    const day = tempDate.getDay() || 7;
    tempDate.setDate(tempDate.getDate() + 4 - day);
    // Get first day of year
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(
      ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return weekNo;
  }

  private obtenerAnioISO(fecha: Date): number {
    const tempDate = new Date(
      Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
    );
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum); // jueves
    return tempDate.getUTCFullYear(); // devuelve el año ISO
  }

  private agruparPorPeriodo(
    tipo: 'día' | 'semana' | 'mes' | 'año',
  ): ResumenAgrupado[] {
    const agrupado: { [key: string]: RegistroSobrante[] } = {};

    for (const reg of this.sobrantesOriginal) {
      const fecha = new Date(reg.fecha);
      let clave: string;

      switch (tipo) {
        case 'día':
          clave = reg.fecha;
          break;

        case 'semana':
          const semana = this.obtenerSemanaISO(fecha);
          const añoISO = this.obtenerAnioISO(fecha);
          clave = `Semana ${String(semana).padStart(2, '0')} - ${añoISO}`;
          break;

        case 'mes':
          const nombreMes = fecha.toLocaleString('es-MX', { month: 'long' });
          clave = `${this.capitalizar(nombreMes)} ${fecha.getFullYear()}`;
          break;

        case 'año':
          clave = `${fecha.getFullYear()}`;
          break;
      }

      if (!agrupado[clave]) agrupado[clave] = [];
      agrupado[clave].push(reg);
    }

    const resumenes: ResumenAgrupado[] = [];

    for (const periodo in agrupado) {
      const grupo = agrupado[periodo];
      const totalEntregadas = grupo.reduce((sum, r) => sum + r.entregadas, 0);
      const totalSobrantes = grupo.reduce((sum, r) => sum + r.sobrantes, 0);
      const clientesEnAlerta = grupo.filter((r) => r.alerta).length;
      const porcentajeSobrantes =
        totalEntregadas > 0
          ? +((totalSobrantes / totalEntregadas) * 100).toFixed(1)
          : 0;

      resumenes.push({
        periodo,
        totalEntregadas,
        totalSobrantes,
        porcentajeSobrantes,
        clientesEnAlerta,
      });
    }

    return resumenes.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  obtenerNombreCliente(id: string): string {
    const cliente = this.registros.find((r) => r.clienteId === id);
    return cliente?.clienteNombre ?? 'Desconocido';
  }

  obtenerNombreRepartidor(id?: string): string {
    if (!id) return 'Desconocido';
    const user = this.listaDeUsuarios.find((u) => u.uid === id);
    if (!user) return 'Desconocido';
    console.log('Buscando repartidor con id:', id, '->', user);

    // Si nombre es null o vacío, mostrar correo, si no existe correo, mostrar 'Desconocido'
    return user.nombre?.trim() || user.correo || 'Desconocido';
  }

  get resumenActual(): ResumenAgrupado[] {
    switch (this.vistaSeleccionada) {
      case 'semana':
        return this.resumenPorSemana;
      case 'mes':
        return this.resumenPorMes;
      case 'año':
        return this.resumenPorAnio;
      default:
        return this.resumenPorDia;
    }
  }

  // Agrupa los registros individuales por periodo (fecha, semana, mes, etc.)
  get registrosPorPeriodo() {
    const agrupados: Record<string, RegistroSobrante[]> = {};

    for (const reg of this.sobrantes) {
      const fecha = new Date(reg.fecha);
      let clave = '';

      switch (this.vistaSeleccionada) {
        case 'semana':
          clave = `Semana ${this.obtenerSemanaISO(fecha)} - ${this.obtenerAnioISO(fecha)}`;
          break;
        case 'mes':
          clave = `${fecha.toLocaleString('es-MX', { month: 'long' })} ${fecha.getFullYear()}`;
          break;
        case 'año':
          clave = `${fecha.getFullYear()}`;
          break;
        default:
          clave = reg.fecha;
      }

      if (!agrupados[clave]) agrupados[clave] = [];
      agrupados[clave].push(reg);
    }

    return Object.entries(agrupados)
      .map(([periodo, registros]) => ({
        periodo,
        registros,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  // Control de colapsado
  colapsados: Record<string, boolean> = {};
  toggleColapsado(periodo: string) {
    this.colapsados[periodo] = !this.colapsados[periodo];
  }

  private capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  getRegistrosPaginados(
    periodo: string,
    registros: RegistroSobrante[],
  ): RegistroSobrante[] {
    if (!this.paginacionPorPeriodo[periodo]) {
      this.paginacionPorPeriodo[periodo] = { pagina: 1 };
    }

    const pagina = this.paginacionPorPeriodo[periodo]?.pagina || 1;
    const inicio = (pagina - 1) * this.itemsPorPaginaPeriodo;
    return registros.slice(inicio, inicio + this.itemsPorPaginaPeriodo);
  }

  getTotalPaginasPeriodo(registros: any[]): number {
    return Math.ceil(registros.length / this.itemsPorPaginaPeriodo);
  }

  cambiarPaginaPeriodo(periodo: string, nuevaPagina: number) {
    if (!this.paginacionPorPeriodo[periodo]) {
      this.paginacionPorPeriodo[periodo] = { pagina: 1 };
    }
    this.paginacionPorPeriodo[periodo].pagina = nuevaPagina;
  }

  private calcularAlertas(
    registros: RegistroSobrante[],
    umbralAlerta = 20,
  ): void {
    registros.forEach((r) => {
      r.porcentaje =
        r.entregadas > 0 ? +((r.sobrantes / r.entregadas) * 100).toFixed(1) : 0;
      r.alerta = r.porcentaje > umbralAlerta;
    });
  }

  // dashboard.component.ts
  get usuario() {
    return this.authService.getUsuario();
  }

  get autenticado(): boolean {
    return this.authService.estaAutenticado();
  }
}
