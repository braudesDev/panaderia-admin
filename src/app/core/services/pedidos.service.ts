import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


export interface Pedido {
  id?: string;
  cliente: string;
  tiras: number;
  fecha: string;
  hora?: string;
  notas?: string;
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
    return collectionData(pedidosRef, { idField: 'id' }) as Observable<Pedido[]>;
  }


  eliminarPedido(id: string): Promise<void> {
    const pedidoDocRef = doc(this.firestore, `pedidos/${id}`);
    return deleteDoc(pedidoDocRef);
  }
}
