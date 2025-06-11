//Modulos y dependencias necesarias
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
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  // Variables de formulario
  nombre = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  //Control de visibilidad de campos/formularios
  mostrarContrasena = false;
  mostrarRegistro = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    //Si el usuario ya esta autenticado, redirigirlo automaticamente
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/home']); // Se puede personalizar segun el rol
    }
  }

  //Metodo para iniciar sesion con correo y contrasena
  async iniciarSesion() {
    try {
      await this.authService.loginConEmail(this.correo, this.contrasena);
      //Redireccion automatica ya esta en el servicio segun el rol
    } catch (error) {
      alert('Error al iniciar sesión. Verifica tus datos.');
    }
  }

  //Metodo para iniciar sesion con google
  async loginConGoogle() {
    try {
      await this.authService.loginConGoogle();
      //Redireccion tambien se maneja desde el servicio
    } catch (error) {
      console.error('Fallo en el login:', error);
      alert('No se pudo iniciar sesión. Intenta de nuevo.');
    }
  }

  //Alterna entre formulario de login y de registro
  cambiarFormulario(event: Event) {
    event.preventDefault();
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  //Metodo para registrar un nuevo usuario
  registrarUsuario(event: Event) {
    event.preventDefault();

    //Validacion de contrasena
    if (this.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }
    //Registrar usuario mediante AuthService
    this.authService
      .registrarConEmail(this.correo, this.contrasena, this.nombre)
      .then(() => {
        alert('Cuenta creada con éxito');
        this.mostrarRegistro = false; //Volver al formulario de login
      })
      .catch((error) => {
        console.error('Error al registrar:', error);
        alert('Error al registrar: ' + error.message);
      });
  }
}
