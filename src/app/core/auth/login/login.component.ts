import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  nombre= '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  mostrarContrasena = false;
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

  async iniciarSesion() {
  try {
    await this.authService.loginConEmail(this.correo, this.contrasena);
  } catch (error) {
    alert('Error al iniciar sesión. Verifica tus datos.');
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

  if (this.contrasena !== this.confirmarContrasena) {
    alert('Las contraseñas no coinciden');
    return;
  }

  this.authService.registrarConEmail(this.correo, this.contrasena, this.nombre)
    .then(() => {
      alert('Cuenta creada con éxito');
      this.mostrarRegistro = false;
    })
    .catch(error => {
      console.error('Error al registrar:', error);
      alert('Error al registrar: ' + error.message);
    });
}



}
