import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../../shared/toast/toast.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],

})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  @ViewChild(ToastComponent) toast!: ToastComponent;


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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres cambiar el rol del usuario a "${nuevoRol}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await this.cambiarRol(uid, nuevoRol);
      this.toast.show('Rol actualizado correctamente.');
    }
  }

  async confirmarEliminarUsuario(uid: string) {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await this.eliminarUsuario(uid);
      this.toast.show('Usuario eliminado correctamente.');
    }
  }
}
