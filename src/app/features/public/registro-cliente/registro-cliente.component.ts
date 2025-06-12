//Importaciones necesarias desde angular y otros modulos
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Cliente,
  ClienteService,
} from '../../../core/services/cliente.service';
import { QrGeneratorComponent } from '../../../shared/qr-generator/qr-generator.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, QrGeneratorComponent],
  templateUrl: './registro-cliente.component.html',
  styleUrls: ['./registro-cliente.component.css'],
})
export class RegistroClienteComponent implements OnInit {
  constructor(
    private clienteService: ClienteService,
    private router: Router,
  ) {}

  //Objetos cliente que se vincula con los campos del formulario
  cliente = {
    nombre: '',
    telefono: '',
    id: '',
    direccion: '',
  };

  //Bandera para mostrar u ocultar el QR generado
  qrGenerado = false;

  //Almacena el ID del cliente, usado como valor del QR
  qrId = '';

  //Arreglo local de clientes (se usa para mostrar o recargar la lista)
  clientes: Cliente[] = [];

  // Bandera opcional que podria mostrar los QRs generados (no se usa directamente aqui)
  mostrarQrs = false;

  // Bandera para controlar si el formulario fue enviado
  enviado = false;

  //Metodo principal para registrar un cliente
  registrarCliente() {
    this.cliente.id = crypto.randomUUID(); // Se genera un ID unico para el cliente
    const clienteAGuardar = { ...this.cliente };//Se crea una copia del objeto cliente

    this.clienteService
      .guardarCliente(clienteAGuardar) //Llama al servicio para guardar al cliente en firestore
      .then(() => {
        this.qrGenerado = true; //Activa la bandera para mostrar el QR
        this.qrId = this.cliente.id; //Asigna el ID generado para el QR
        console.log('Cliente guardado'); //Lod de confirmacion
        this.cargarClientes(); // Recarga la lista de clientes desde firestore
      })
      .catch((err) => console.error('Error al guardar:', err)); //Captura errores en la consola
  }

  // Metodo para limpiar el formulario y reiniciar banderas
  limpiarFormulario() {
    this.cliente = {
      nombre: '',
      telefono: '',
      id: '',
      direccion: '',
    };
    this.qrGenerado = false;
    this.enviado = false;
  }

  // Carga los clientes desde el servicio y los ordena por nombre
  cargarClientes() {
    this.clienteService.obtenerClientes().subscribe((clientes) => {
      this.clientes = clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  //Navega hacia la vista de QRs generadas
  irAQrsGenerados() {
    this.router.navigate(['/qr-generados']);
  }

  //Hook de inicializacion del componente
  ngOnInit() {
    this.cargarClientes(); //Al iniciar, carga la lista de clientes
  }
}
