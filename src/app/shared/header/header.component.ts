//Importacion de modulos y dependencias necesarias
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service'; // Ajusta la ruta según tu proyecto
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  //Almacena el rol actual del usuario (admin, repartidor, cliente, etc.)
  rolUsuario: string | null = null;

  //Indica si el usuario a iniciado sesion
  estaLogueado = false;

  //Variables para controlar el scroll y el estado de la barra de navegacion
  lastScrollTop = 0;
  navHidden = false;

  //Controla si el menu hamburguesa esta desplegado o no
  isMenuOpen = false;

  //Arreglo para almacenar las suscripciones y poder limpiarlas al destruir el componenete
  private subs: Subscription[] = [];

  constructor(private authService: AuthService) {}

  //Hook de inicializacion del componente
  ngOnInit() {
    //Suscripcion al observable de autenticacion para saber si el usuario esta logueado
    this.subs.push(
      this.authService.estaLogueado$.subscribe((logueado) => {
        this.estaLogueado = logueado;
      }),
    );

    //Suscripcion al observable que devuelve el rol del usuario actual
    this.subs.push(
      this.authService.rolUsuario$.subscribe((rol) => {
        this.rolUsuario = rol;
      }),
    );
  }

  //Hook que se ejecuta al destruir el componente: limpia todas las suscripciones activas
  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  //Escucha el evento de scroll en la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollTop = window.scrollY;

    if (currentScrollTop > this.lastScrollTop) {
      // Si el usuario hace scroll hacia abajo, ocualta el navbar
      this.navHidden = true;
    } else {
      // Si el usuario hace scroll hacia arriba, muestra el navbar
      this.navHidden = false;
    }

    // Actualiza la posicion del scroll actual
    this.lastScrollTop = currentScrollTop;
  }

  //Alterna el estado del menu hamburguesa
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  //Cierra el menu hamburguesa al hacer clic en un enlace de navegacion
  onNavClick() {
    this.isMenuOpen = false; // Cierra el menú hamburguesa
    this.navHidden = false; // Muestra el navbar cuando se hace clic en un enlace
  }

  //Cierra la sesion del usuario y recarga la pagina
  logout() {
    this.authService.logout();//Llama al metodo de cierre de sesion
    window.location.reload(); // Esto recarga la pagina para reiniciar el estado de la app
  }
}
