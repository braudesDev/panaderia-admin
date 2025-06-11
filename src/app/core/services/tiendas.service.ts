import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TiendasService {
  constructor(private firestore: Firestore) {}

  async getTiendas(): Promise<any[]> {
    const tiendasRef = collection(this.firestore, 'tiendas');
    return await firstValueFrom(collectionData(tiendasRef, { idField: 'id' }));
  }
}
