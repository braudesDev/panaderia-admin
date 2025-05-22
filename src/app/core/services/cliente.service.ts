import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  CollectionReference,
  DocumentReference,
  setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Cliente {
  id: string;  // Opcional porque no existe al crear nuevo cliente
  nombre: string;
  telefono: string;
  direccion: string;
}


@Injectable({ providedIn: 'root' })
export class ClienteService {
  // Referencia reutilizable a la colección
  private clientesRef: CollectionReference<Cliente>;

  constructor(private firestore: Firestore, private ngZone: NgZone) {
    this.clientesRef = collection(this.firestore, 'clientes') as CollectionReference<Cliente>;
  }

    agregarCliente(cliente: Cliente): Promise<void> {
    const clienteRef = doc(this.firestore, `clientes/${cliente.id}`);
    return setDoc(clienteRef, cliente);
  }

    obtenerClientes(): Observable<Cliente[]> {
    return new Observable(observer => {
      this.ngZone.run(() => {
        collectionData(this.clientesRef, { idField: 'id' }).subscribe({
          next: data => observer.next(data as Cliente[]),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      });
    });
  }

  async obtenerClientePorId(id: string): Promise<Cliente | null> {
    const docRef = doc(this.firestore, `clientes/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Cliente;
    }
    return null;
  }
}
