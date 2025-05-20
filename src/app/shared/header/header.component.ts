import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';  // Ajusta la ruta según tu proyecto

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  rolUsuario: string | null = null;
  estaLogueado = false;

  lastScrollTop = 0;
  navHidden = false;
  isMenuOpen = false; // Controla si el menú hamburguesa está abierto

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.estaLogueado = this.authService.estaAutenticado();
    this.rolUsuario = this.authService.getRol();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollTop = window.scrollY;

    if (currentScrollTop > this.lastScrollTop) {
      // Scroll hacia abajo → Ocultar navbar
      this.navHidden = true;
    } else {
      // Scroll hacia arriba → Mostrar navbar
      this.navHidden = false;
    }

    this.lastScrollTop = currentScrollTop;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavClick() {
    this.isMenuOpen = false; // Cierra el menú hamburguesa
    this.navHidden = false; // Muestra el navbar cuando se hace clic en un enlace
  }

  logout() {
  this.authService.logout();
  window.location.reload(); // Esto recarga y fuerza que el header se actualice
}
}
