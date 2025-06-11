import { Pipe, PipeTransform } from '@angular/core';
import { Pedido } from '../../core/services/pedidos.service';

@Pipe({
  name: 'clienteFiltro',
  standalone: true,
})
export class ClienteFiltroPipe implements PipeTransform {
  transform(pedidos: Pedido[], filtro: string): Pedido[] {
    if (!filtro) return pedidos;
    const filtroLower = filtro.toLowerCase();
    return pedidos.filter((p) => p.cliente.toLowerCase().includes(filtroLower));
  }
}
