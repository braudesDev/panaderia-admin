import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Typewriter from 'typewriter-effect/dist/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.iniciarTypewriter();
  }

  private iniciarTypewriter(): void {
    new Typewriter('#nombre-panaderia1', {
      strings: [
        'Candy',
        'Exquisita',
        'con sabores unicos',
        'Deliciosa',
        'Tradicional',
        'Artesanal',
      ],
      autoStart: true,
      loop: true,
    });
  }

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

  get rol(): 'admin' | 'cliente' | 'repartidor' | null {
  // Devuelve el rol del usuario actual
  return this.authService.getRol();
}


}
