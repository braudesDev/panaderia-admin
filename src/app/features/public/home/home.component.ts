import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private AuthService: AuthService) {}

  loginComo(rol: 'admin' | 'cliente' | 'repartidor') {
    let usuarioSimulado: any = null;

    if (rol === 'cliente') {
      usuarioSimulado = {
        id: 'cli-001',
        nombre: 'Repartidor de ejemplo'
      };
    } else if (rol === 'admin') {
      usuarioSimulado = {
        id: 'adm-001',
        nombre: 'Administrador de ejemplo'
      };
    }
    this.AuthService.login(rol, usuarioSimulado);
    window.location.reload();
  }

  logout() {
    this.AuthService.logout();
  }
}
