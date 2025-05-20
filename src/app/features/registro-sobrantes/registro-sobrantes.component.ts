import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-sobrantes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro-sobrantes.component.html',
  styleUrls: ['./registro-sobrantes.component.css']
})
export class RegistroSobrantesComponent implements OnInit {
  clienteId: string = '';
  entregadas: number = 0;
  sobrantes: number = 0;
  mensaje: string = '';
  esAlerta: boolean = false;

  historial: {
    clienteId: string;
    entregadas: number;
    sobrantes: number;
    porcentaje: number;
    alerta: boolean;
    fecha: string;
    sincronizado?: boolean; // opcional para marcar si ya se subió
  }[] = [];

  ngOnInit() {
    const data = localStorage.getItem('historialSobrantes');
    if (data) {
      this.historial = JSON.parse(data);
    }
  }

  registrar() {
    if (this.entregadas <= 0 || this.sobrantes < 0) {
      this.mensaje = '❌ Los datos ingresados no son válidos.';
      this.esAlerta = true;
      return;
    }

    const porcentaje = (this.sobrantes / this.entregadas) * 100;
    const alerta = porcentaje > 30;

    this.mensaje = alerta
      ? `⚠️ ¡Alerta! Este cliente tiene ${porcentaje.toFixed(1)}% de sobrantes. No se deben dejar más bolillos hoy.`
      : `✅ Cliente dentro del límite permitido (${porcentaje.toFixed(1)}% de sobrantes).`;
    this.esAlerta = alerta;

    const nuevoRegistro = {
      clienteId: this.clienteId,
      entregadas: this.entregadas,
      sobrantes: this.sobrantes,
      porcentaje: +porcentaje.toFixed(1),
      alerta,
      fecha: new Date().toLocaleString(),
      sincronizado: false,
    };

    this.historial.unshift(nuevoRegistro);

    localStorage.setItem('historialSobrantes', JSON.stringify(this.historial));

    this.clienteId = '';
    this.entregadas = 0;
    this.sobrantes = 0;
  }

  sincronizarConFirebase() {
    // Simulamos la sincronización con un Promise que resuelve después de 2 segundos
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Imagina que aquí haces la llamada real a Firebase y funciona bien
        resolve();
      }, 2000);
    })
      .then(() => {
        // Marcar todo como sincronizado
        this.historial = this.historial.map((item) => ({
          ...item,
          sincronizado: true,
        }));
        localStorage.setItem('historialSobrantes', JSON.stringify(this.historial));
        this.mensaje = '✅ Historial sincronizado con Firebase';
        this.esAlerta = false;
      })
      .catch((err) => {
        this.mensaje = '❌ Error al sincronizar con Firebase';
        this.esAlerta = true;
        console.error(err);
      });
  }
}
