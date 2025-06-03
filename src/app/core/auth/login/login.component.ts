import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

mostrarRegistro = false;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
      if (this.authService.estaAutenticado()) {
      this.router.navigate(['/home']); // o directamente a su ruta por rol
    }
  }

  async loginConGoogle() {
  try {
    await this.authService.loginConGoogle();
    // No necesitas redireccionar aquí, ya lo hace el AuthService por rol
  } catch (error) {
    console.error('Fallo en el login:', error);
    alert('No se pudo iniciar sesión. Intenta de nuevo.');
  }
}

  cambiarFormulario(event: Event) {
    event.preventDefault();
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  registrarUsuario(event: Event) {
    event.preventDefault();
    // Tu lógica para registrar usuario con Firebase
    console.log('Usuario registrado');
  }

}
