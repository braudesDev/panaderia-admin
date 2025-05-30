import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { getISOWeek, getYear } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChartRef', { static: false, read: BaseChartDirective }) barChart!: BaseChartDirective;
  @ViewChild('pieChartRef', { static: false, read: BaseChartDirective }) pieChart!: BaseChartDirective;

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
  vistaSeleccionada: 'dia' | 'semana' | 'mes' | 'anio' = 'dia';
  fechaSeleccionada: string = this.obtenerFechaHoy();

  // Configuración de gráficos
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Entregadas', data: [], backgroundColor: '#0CF2C4' },
      { label: 'Sobrantes', data: [], backgroundColor: '#F54301' }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'top' } }
  };

  pieChartData: ChartData<'doughnut'> = {
    labels: ['Clientes en alerta', 'Clientes normales'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#F40033', '#0CF231']
      }
    ]
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  private refreshSubscription!: Subscription;

  constructor(
    private rutaService: RutaService,
    private sobranteService: SobrantesService,
  ) {}

  ngOnInit() {
    this.cargarRegistros();
    this.cargarSobrantes();

    // Configurar intervalo de actualización (5 minutos)
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      const hoy = this.obtenerFechaHoy();
      if (hoy !== this.fechaSeleccionada) {
        this.fechaSeleccionada = hoy;
        this.vistaSeleccionada = 'dia';
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
    this.rutaService.obtenerRegistros().subscribe(data => {
      this.registros = data.sort((a, b) => b.fecha.localeCompare(a.fecha));
    });
  }

  cargarSobrantes() {
    this.sobranteService.obtenerTodos().subscribe(data => {
      this.sobrantesOriginal = data.sort((a, b) => b.fecha.localeCompare(a.fecha));
      this.sobrantes = [...this.sobrantesOriginal];
      this.aplicarFiltroPorFecha();
      this.calcularResumen();

      this.resumenPorDia = this.agruparPorPeriodo('dia');
      this.resumenPorSemana = this.agruparPorPeriodo('semana');
      this.resumenPorMes = this.agruparPorPeriodo('mes');
      this.resumenPorAnio = this.agruparPorPeriodo('anio');

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
    const resumen = this.resumenActual;

    this.barChartData.labels = resumen.map(r => r.periodo);
    this.barChartData.datasets[0].data = resumen.map(r => r.totalEntregadas);
    this.barChartData.datasets[1].data = resumen.map(r => r.totalSobrantes);

    // Actualizar gráfico de dona con datos filtrados según vista actual
    const totalClientes = this.sobrantes.length;
    const clientesEnAlerta = this.sobrantes.filter(s => s.alerta).length;
    const clientesNormales = totalClientes - clientesEnAlerta;
    this.pieChartData.datasets[0].data = [clientesEnAlerta, clientesNormales];
    this.pieChartData = { ...this.pieChartData };

    // Forzar actualización de las gráficas
    setTimeout(() => {
      if (this.barChart?.chart) {
        this.barChart.chart.update();
      }
      if (this.pieChart?.chart) {
        this.pieChart.chart.update();
      }
    }, 0);
  } catch (error) {
    console.error('Error al actualizar gráficas:', error);
  }
}

  aplicarFiltroPorFecha() {
    if (this.vistaSeleccionada === 'dia') {
      this.sobrantes = this.sobrantesOriginal.filter(s => s.fecha === this.fechaSeleccionada);
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
    this.actualizarGraficas();
  }

  calcularPorcentaje(sobrantes: number, entregadas: number): string {
    return entregadas > 0 ? ((sobrantes / entregadas) * 100).toFixed(1) : '0';
  }

  calcularResumen() {
    const umbralAlerta = 20;

    this.totalEntregadas = this.sobrantes.reduce((sum, r) => sum + r.entregadas, 0);
    this.totalSobrantes = this.sobrantes.reduce((sum, r) => sum + r.sobrantes, 0);
    this.porcentajeSobrantes = this.totalEntregadas > 0
      ? +(this.totalSobrantes / this.totalEntregadas * 100).toFixed(1)
      : 0;

    this.sobrantes.forEach(r => {
      r.porcentaje = r.entregadas > 0 ? +(r.sobrantes / r.entregadas * 100).toFixed(1) : 0;
      r.alerta = r.porcentaje > umbralAlerta;
    });

    this.clientesEnAlerta = this.sobrantes.filter(r => r.alerta).length;
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
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}


private obtenerAnioISO(fecha: Date): number {
  const tempDate = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum); // jueves
  return tempDate.getUTCFullYear(); // devuelve el año ISO
}




  private agruparPorPeriodo(tipo: 'dia' | 'semana' | 'mes' | 'anio'): ResumenAgrupado[] {
    const agrupado: { [key: string]: RegistroSobrante[] } = {};

    for (const reg of this.sobrantesOriginal) {
      const fecha = new Date(reg.fecha);
      let clave: string;

  switch (tipo) {
    case 'dia':
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

    case 'anio':
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
      const clientesEnAlerta = grupo.filter(r => r.alerta).length;
      const porcentajeSobrantes = totalEntregadas > 0
        ? +(totalSobrantes / totalEntregadas * 100).toFixed(1)
        : 0;

      resumenes.push({
        periodo,
        totalEntregadas,
        totalSobrantes,
        porcentajeSobrantes,
        clientesEnAlerta

      });
    }

    return resumenes.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  obtenerNombreCliente(id: string): string {
    const cliente = this.registros.find(r => r.clienteId === id);
    return cliente?.clienteNombre ?? 'Desconocido';
  }

  get resumenActual(): ResumenAgrupado[] {
    switch (this.vistaSeleccionada) {
      case 'semana': return this.resumenPorSemana;
      case 'mes': return this.resumenPorMes;
      case 'anio': return this.resumenPorAnio;
      default: return this.resumenPorDia;
    }
  }

  // Agrupa los registros individuales por periodo (fecha, semana, mes, etc.)
  get registrosPorPeriodo() {
  const grupos: { periodo: string, registros: any[] }[] = [];
  const agrupados: Record<string, any[]> = {};

  if (this.vistaSeleccionada === 'semana') {
    for (const reg of this.sobrantes) {
      const fecha = new Date(reg.fecha);
      const semana = this.obtenerSemanaISO(fecha);
      const anio = this.obtenerAnioISO(fecha);
      const key = `Semana ${String(semana).padStart(2, '0')} - ${anio}`;
      agrupados[key] = agrupados[key] || [];
      agrupados[key].push(reg);
    }
  } else if (this.vistaSeleccionada === 'mes') {
    for (const reg of this.sobrantes) {
      const fecha = new Date(reg.fecha);
      const nombreMes = fecha.toLocaleString('es-MX', { month: 'long' });
      const key = `${this.capitalizar(nombreMes)} ${fecha.getFullYear()}`;
      agrupados[key] = agrupados[key] || [];
      agrupados[key].push(reg);
    }
  } else if (this.vistaSeleccionada === 'anio') {
    for (const reg of this.sobrantes) {
      const fecha = new Date(reg.fecha);
      const key = `${fecha.getFullYear()}`;
      agrupados[key] = agrupados[key] || [];
      agrupados[key].push(reg);
    }
  } else { // 'dia' o cualquier otro caso
    for (const reg of this.sobrantes) {
      agrupados[reg.fecha] = agrupados[reg.fecha] || [];
      agrupados[reg.fecha].push(reg);
    }
  }

  for (const periodo of Object.keys(agrupados).sort().reverse()) {
    grupos.push({ periodo, registros: agrupados[periodo] });
  }
  return grupos;
}

  // Control de colapsado
  colapsados: Record<string, boolean> = {};
  toggleColapsado(periodo: string) {
    this.colapsados[periodo] = !this.colapsados[periodo];
  }

  private capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

}
