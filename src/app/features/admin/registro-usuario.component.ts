import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  templateUrl: './registro-usuario.component.html',
  imports: [CommonModule, FormsModule],
})
export class RegistroUsuarioComponent {
  uid: string = '';
  correo: string = '';
  rol: 'admin' | 'cliente' | 'repartidor' = 'cliente';

  constructor(private firestore: Firestore) {}

  async registrarUsuario() {
    if (!this.uid || !this.correo) {
      alert('Por favor, completa el UID y el correo');
      return;
    }

    const userRef = doc(this.firestore, 'usuarios', this.uid);
    await setDoc(userRef, {
      correo: this.correo,
      rol: this.rol,
    });

    alert('Usuario registrado con éxito.');
    this.uid = '';
    this.correo = '';
    this.rol = 'cliente';
  }

  // Simulación si aún no existe en Firebase Auth (solo para pruebas)
  generarUIDSimulado(correo: string): string {
    return btoa(correo).substring(0, 28); // UID simulado
  }
}
