import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  setDoc,
  DocumentData,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Cliente {
  id?: string;  // Opcional porque no existe al crear
  nombre: string;
  telefono: string;
  direccion: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private clientesRef: CollectionReference<Cliente>;

    constructor(private firestore: Firestore) {
    this.clientesRef = collection(this.firestore, 'clientes') as CollectionReference<Cliente>;
  }

  // Versión más limpia para obtener clientes
  obtenerClientes(): Observable<(Cliente & { id: string })[]> {
    return collectionData(this.clientesRef, {
      idField: 'id' // Inyecta el ID del documento en este campo
    }) as Observable<(Cliente & { id: string })[]>;
  }

  // Versión mejorada para agregar/actualizar
  async guardarCliente(cliente: Cliente): Promise<string> {
    try {
      if (cliente.id) {
        // Actualizar existente
        await setDoc(doc(this.firestore, `clientes/${cliente.id}`), cliente);
        return cliente.id;
      } else {
        // Crear nuevo
        const docRef = await addDoc(this.clientesRef, cliente);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error guardando cliente:', error);
      throw error;
    }
  }

  // Versión más robusta para obtener por ID
  async obtenerClientePorId(id: string): Promise<Cliente | undefined> {
    const docRef = doc(this.firestore, `clientes/${id}`);
    const docSnap = await getDoc(docRef);

    return docSnap.exists() ?
      { id: docSnap.id, ...docSnap.data() } as Cliente :
      undefined;
  }
}
