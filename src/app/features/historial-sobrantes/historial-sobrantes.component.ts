import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClienteContextService } from '../../core/services/cliente-context.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-historial-sobrantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-sobrantes.component.html',
  styleUrls: ['./historial-sobrantes.component.css']
})
export class HistorialSobrantesComponent implements OnInit {
  historial: {
    clienteId: string;
    entregadas: number;
    sobrantes: number;
    porcentaje: number;
    alerta: boolean;
    fecha: string;
    sincronizado?: boolean;
  }[] = [];

  constructor(
    private router: Router,
    private clienteContext: ClienteContextService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('/historialSobrantes');
    const rolUsuario = this.authService.getRol();
    const usuario = this.authService.getUsuario();

    if (data) {
       const historialCompleto = JSON.parse(data);

       if (rolUsuario == 'admin') {
        this.historial = historialCompleto;
       } else if (rolUsuario === 'repartidor') {
        // Aqui podemos decidir si filtrar por tiendas asignadas o mostrar todo
        this.historial = historialCompleto.filter(
          (registro: any) => registro.clienteId === usuario.id
        );
      }
    }
  }

  regresar() {
  const rolUsuario = this.authService.getRol();
  if (rolUsuario === 'repartidor') {
    this.router.navigate(['repartidor/registro-sobrantes']);
  } else {
    this.router.navigate(['/']); // o alguna otra ruta según el rol
  }
}
}
