export interface RegistroSobrante {
  clienteId: string;
  entregadas: number;
  sobrantes: number;
  porcentaje: number;
  alerta: boolean;
  fecha: string;
  sincronizado?: boolean;
  repartidorId?: string;
  id?: string;
}
