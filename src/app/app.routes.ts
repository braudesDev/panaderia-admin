import { PedidoAnticipadoComponent } from './features/public/pedidos/pedido-anticipado.component';
import { HomeComponent } from './features/public/home/home.component';
import { PedidosListaComponent } from './features/public/pedidos/pedidos-lista.component';
import { authGuard } from './core/auth/auth.guard';
import { RegistroSobrantesComponent } from './features/registro-sobrantes/registro-sobrantes.component';
import { RutaDelDiaComponent } from './features/repartidor/ruta-del-dia.component';
import { RegistroClienteComponent } from './features/public/registro-cliente/registro-cliente.component';
import { RegistrarPedidoComponent } from './features/repartidor/registrar-pedido.component';

export const routes = [
  { path: '', component: HomeComponent },
  {
    path: 'pedidos',
    component: PedidoAnticipadoComponent,
    canActivate: [authGuard],
    data: { roles: ['cliente', 'admin'] }
  },
  {
    path: 'lista-pedidos',
    component: PedidosListaComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'repartidor'] }
  },
  {
    path: 'repartidor/registro-sobrantes',
    component: RegistroSobrantesComponent,
    canActivate: [authGuard],
    data: { roles: ['repartidor'] }
  },
  {
    path: 'repartidor/ruta-del-dia',
    component: RutaDelDiaComponent,
    canActivate: [authGuard],
    data: { roles: ['repartidor'] }
  },
  {
    path: 'registro-cliente',
    component: RegistroClienteComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'cliente']}
  },
  {
    path: 'repartidor/registrar-pedido',
    component: RegistrarPedidoComponent,
    canActivate:[authGuard],
    data: { roles: ['repartidor'] }
  }



];
