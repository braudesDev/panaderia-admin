export interface Usuario {
  uid: string;
  correo?: string | null;
  nombre: string | null;         // Lo puedes mapear desde displayName de Firebase
  rol: 'admin' | 'repartidor';
  puedeSalirDeRuta?: boolean;
  tiendasAsignadas: string[];
}
