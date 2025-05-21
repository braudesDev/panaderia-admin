import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { RegistroDeRuta } from '../../features/repartidor/ruta-del-dia.component';
import { CollectionReference, DocumentData } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RutaService {

  private coleccionRuta: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.coleccionRuta = collection(this.firestore, 'rutas'); // Nombre de la colección en Firestore
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
}
