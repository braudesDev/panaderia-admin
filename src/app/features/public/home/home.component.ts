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
  constructor(private authService: AuthService) {}

  iniciarSesionConGoogle() {
    this.authService.loginConGoogle();
  }

  logout() {
    this.authService.logout();
  }

  get autenticado(): boolean {
  return this.authService.estaAutenticado();
  }

  get usuario() {
    return this.authService.getUsuario();
  }

}
