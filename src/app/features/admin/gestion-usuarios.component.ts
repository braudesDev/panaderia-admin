import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],

})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    const colRef = collection(this.firestore, 'usuarios');
    const snapshot = await getDocs(colRef);
    this.usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async cambiarRol(uid: string, nuevoRol: 'admin' | 'cliente' | 'repartidor') {
    const userRef = doc(this.firestore, 'usuarios', uid);
    await updateDoc(userRef, { rol: nuevoRol });
    await this.cargarUsuarios();
  }

  async eliminarUsuario(uid: string) {
    const userRef = doc(this.firestore, 'usuarios', uid);
    await deleteDoc(userRef);
    await this.cargarUsuarios();
  }

    async confirmarCambiarRol(uid: string, nuevoRol: 'admin' | 'cliente' | 'repartidor') {
    const confirmado = window.confirm(`¿Estás seguro de cambiar el rol del usuario a "${nuevoRol}"?`);
    if (confirmado) {
      await this.cambiarRol(uid, nuevoRol);
      alert('Rol actualizado correctamente.');
    }
  }

  async confirmarEliminarUsuario(uid: string) {
    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.');
    if (confirmado) {
      await this.eliminarUsuario(uid);
      alert('Usuario eliminado correctamente.');
    }
  }
}
