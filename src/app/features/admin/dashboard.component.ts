import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutaService } from '../../core/services/ruta.service';
import { RegistroDeRuta } from '../../features/repartidor/ruta-del-dia.component'; // o ajusta según la ubicación real

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  registros: RegistroDeRuta[] = [];

  constructor(private rutaService: RutaService) {}

  ngOnInit() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.rutaService.obtenerRegistros().subscribe(data => {
      this.registros = data.sort((a, b) => b.fecha.localeCompare(a.fecha)); // orden descendente por fecha
    });
  }
}
