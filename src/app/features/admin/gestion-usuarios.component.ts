import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../../shared/toast/toast.component';
import Swal from 'sweetalert2';
import { MatTab } from '@angular/material/tabs';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuariosInternos: any[] = [];
  clientes: any[] = [];

  paginaClientes = 1;
  paginaInternos = 1;
  tamanoPagina = 5;

  tabActivo: 'internos' | 'clientes' = 'internos';

  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    const colRef = collection(this.firestore, 'usuarios');
    const snapshot = await getDocs(colRef);
    this.usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    this.clientes = this.usuarios.filter((u) => u.rol === 'cliente');
    this.usuariosInternos = this.usuarios.filter(
      (u) => u.rol === 'admin' || u.rol === 'repartidor',
    );
  }

  // Métodos para paginación
  get clientesPaginados() {
    const start = (this.paginaClientes - 1) * this.tamanoPagina;
    return this.clientes.slice(start, start + this.tamanoPagina);
  }

  get internosPaginados() {
    const start = (this.paginaInternos - 1) * this.tamanoPagina;
    return this.usuariosInternos.slice(start, start + this.tamanoPagina);
  }

  get totalPaginasClientes() {
    return Math.ceil(this.clientes.length / this.tamanoPagina);
  }

  get totalPaginasInternos() {
    return Math.ceil(this.usuariosInternos.length / this.tamanoPagina);
  }

  paginaAnteriorClientes() {
    if (this.paginaClientes > 1) this.paginaClientes--;
  }

  paginaSiguienteClientes() {
    if (this.paginaClientes < this.totalPaginasClientes) this.paginaClientes++;
  }

  paginaAnteriorInternos() {
    if (this.paginaInternos > 1) this.paginaInternos--;
  }

  paginaSiguienteInternos() {
    if (this.paginaInternos < this.totalPaginasInternos) this.paginaInternos++;
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

  async confirmarCambiarRol(
    uid: string,
    nuevoRol: 'admin' | 'cliente' | 'repartidor',
  ) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres cambiar el rol del usuario a "${nuevoRol}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
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
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await this.eliminarUsuario(uid);
      this.toast.show('Usuario eliminado correctamente.');
    }
  }
}
