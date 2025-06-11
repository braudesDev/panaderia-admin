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
  rolUsuario: string | null = null;
  estaLogueado = false;

  lastScrollTop = 0;
  navHidden = false;
  isMenuOpen = false; // Controla si el menú hamburguesa está abierto

  private subs: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subs.push(
      this.authService.estaLogueado$.subscribe((logueado) => {
        this.estaLogueado = logueado;
      }),
    );

    this.subs.push(
      this.authService.rolUsuario$.subscribe((rol) => {
        this.rolUsuario = rol;
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
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
