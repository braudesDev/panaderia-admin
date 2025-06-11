import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  collectionData,
} from '@angular/fire/firestore';
import { RegistroSobrante } from '../models/sobrante.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SobrantesService {
  private coleccion: CollectionReference;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'sobrantes');
  }

  guardarRegistro(registro: RegistroSobrante) {
    return addDoc(this.coleccion, registro);
  }

  obtenerTodos(): Observable<RegistroSobrante[]> {
    return collectionData(this.coleccion, { idField: 'id' }) as Observable<
      RegistroSobrante[]
    >;
  }
}
