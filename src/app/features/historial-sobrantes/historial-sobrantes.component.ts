import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClienteContextService } from '../../core/services/cliente-context.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '@angular/fire/auth'; // Importar el tipo User

interface RegistroSobrante {
  clienteId: string;
  entregadas: number;
  sobrantes: number;
  porcentaje: number;
  alerta: boolean;
  fecha: string;
  sincronizado?: boolean;
  repartidorId?: string; // Nuevo campo para filtrar por repartidor
}

@Component({
  selector: 'app-historial-sobrantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-sobrantes.component.html',
  styleUrls: ['./historial-sobrantes.component.css']
})
export class HistorialSobrantesComponent implements OnInit {
  historial: RegistroSobrante[] = [];

  constructor(
    private router: Router,
    private clienteContext: ClienteContextService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    const data = localStorage.getItem('historialSobrantes');
    const rolUsuario = this.authService.getRol();
    const usuario = this.authService.getUsuario();

    if (!data) return;

    try {
      const historialCompleto: RegistroSobrante[] = JSON.parse(data);

      if (rolUsuario === 'admin') {
        this.historial = historialCompleto;
      } else if (rolUsuario === 'repartidor' && usuario) {
        // Filtrar por repartidor (usando uid en lugar de id)
        this.historial = historialCompleto.filter(
          registro => registro.repartidorId === usuario.uid
        );
      }
    } catch (error) {
      console.error('Error al parsear historial:', error);
    }
  }

  regresar(): void {
    const rolUsuario = this.authService.getRol();
    const ruta = rolUsuario === 'repartidor'
      ? '/repartidor/registro-sobrantes'
      : '/';
    this.router.navigate([ruta]);
  }
}
