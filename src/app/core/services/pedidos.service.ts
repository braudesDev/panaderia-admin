import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection } from 'firebase/firestore';

export interface Pedido {
  id?: string;
  cliente: string;
  tiras: number;
  fecha: string;
  hora?: string;
  notas?: string;
  mostrarDetalles?: boolean;
  prioridad?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  constructor(private firestore: Firestore) {}

  guardarPedido(pedido: Pedido): Promise<any> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    return addDoc(pedidosRef, pedido);
  }

  obtenerPedidos(): Observable<Pedido[]> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    return collectionData(pedidosRef, { idField: 'id' }) as Observable<
      Pedido[]
    >;
  }

  eliminarPedido(id: string): Promise<void> {
    const pedidoDocRef = doc(this.firestore, `pedidos/${id}`);
    return deleteDoc(pedidoDocRef);
  }

  private pedidoEditando: Pedido | null = null;

  establecerPedidoParaEditar(pedido: Pedido) {
    this.pedidoEditando = pedido;
  }

  obtenerPedidoParaEditar(): Pedido | null {
    return this.pedidoEditando;
  }

  limpiarPedidoEditando() {
    this.pedidoEditando = null;
  }

  actualizarPedido(
    id: string,
    datosActualizados: Partial<Pedido>,
  ): Promise<void> {
    const pedidoDocRef = doc(this.firestore, `pedidos/${id}`);
    return updateDoc(pedidoDocRef, datosActualizados);
  }
}
