import { Pedido, PedidoService } from './../../../core/services/pedidos.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-pedido-anticipado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pedido-anticipado.component.html',
})
export class PedidoAnticipadoComponent {
  pedidoForm: FormGroup;

  constructor(private fb: FormBuilder, private PedidoService: PedidoService) {
    this.pedidoForm = this.fb.group({
      cliente: ['', Validators.required],
      tiras: [1, [Validators.required, Validators.min(1)]],
      fecha: ['', Validators.required],
      notas: [''],
    });
  }

  enviarPedido() {
    if (this.pedidoForm.valid) {
      const pedido = this.pedidoForm.value;
      console.log('Pedido enviado:', pedido);

      // Por ahora lo almacenamos en localStorage
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      pedidos.push(pedido);
      localStorage.setItem('pedidos', JSON.stringify(pedidos));

      alert('Pedido enviado con éxito ✅');
      this.pedidoForm.reset();
    }
  }
}
