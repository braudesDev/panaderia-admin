import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { RegistroDeRuta } from '../../features/repartidor/ruta-del-dia.component';
import { CollectionReference, DocumentData, query, getDocs, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private coleccionRuta: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.coleccionRuta = collection(this.firestore, 'rutas');
  }

  obtenerRegistros(): Observable<RegistroDeRuta[]> {
    return collectionData(this.coleccionRuta, { idField: 'id' }) as Observable<RegistroDeRuta[]>;
  }

  async guardarRegistro(registro: RegistroDeRuta): Promise<void> {
    try {
      await addDoc(this.coleccionRuta, registro);
      console.log('✅ Registro guardado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar registro:', error);
      throw error;
    }
  }

  async verificarRegistroExistente(clienteId: string, fecha: string): Promise<boolean> {
    const q = query(this.coleccionRuta,
      where('clienteId', '==', clienteId),
      where('fecha', '==', fecha)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
}
