//Importacion de modulos y dependencias necesarias
import {
  Component,
  AfterViewInit,
  OnInit,
} from '@angular/core';
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
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  constructor(private authService: AuthService) {}

  //Hook que se ejecuta al inicializar el componente
  ngOnInit(): void {}

  //Hook que se ejecuta cuando la vista ya esta completamente cargada
  ngAfterViewInit(): void {
    this.iniciarTypewriter(); //Inicializa el efecto de texto animado
  }

  //Funcion privada para inicializar el efecto de maquina de escribir
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

  //Llamada al servicio de autenticacion para iniciar sesion con Google
  iniciarSesionConGoogle() {
    this.authService.loginConGoogle();
  }

  //Llamada al servicio de autenticacion para cerrar sesion
  logout() {
    this.authService.logout();
  }

  //Devuelve si el usuario esta autenticado
  get autenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  //Devuelve los datos del usuario autenticado
  get usuario() {
    return this.authService.getUsuario();
  }

  //Devuelve el rol del usuario (admin, cliente o repartidor)
  get rol(): 'admin' | 'cliente' | 'repartidor' | null {
    // Devuelve el rol del usuario actual
    return this.authService.getRol();
  }
}
