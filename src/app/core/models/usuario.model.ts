// models/usuario.model.ts
export interface Usuario {
  uid: string;
  nombre: string;
  rol: 'admin' | 'repartidor';
  puedeSalirDeRuta?: boolean;
  tiendasAsignadas: string[];  // Ids o nombres de tiendas
}
