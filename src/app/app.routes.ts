import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { PedidosListaComponent } from './features/public/pedidos/pedidos-lista.component';
import { authGuard } from './core/auth/auth.guard';
import { RutaDelDiaComponent } from './features/repartidor/ruta-del-dia.component';
import { RegistroClienteComponent } from './features/public/registro-cliente/registro-cliente.component';
import { RegistrarPedidoComponent } from './features/repartidor/registrar-pedido.component';
import { LoginComponent } from './core/auth/login/login.component';
import { DashboardComponent } from './features/admin/dashboard.component'
import { RegistroUsuarioComponent } from './features/admin/registro-usuario.component';
import { GestionUsuariosComponent } from './features/admin/gestion-usuarios.component';
import { QrGeneradosComponent } from './features/public/qr-generados/qr-generados.component'

export const routes: Routes = [
  { path: '',
    component: HomeComponent,
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'lista-pedidos',
    component: PedidosListaComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'repartidor'] }
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
    data: { roles: ['admin', 'repartidor'] }
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['admin']}
  },
  {
    path: 'gestion-usuario',
    component: GestionUsuariosComponent,
    canActivate: [authGuard],
    data: { roles: ['admin']}
  },
  {
    path: 'registro-usuarios',
    component: RegistroUsuarioComponent,
    canActivate: [authGuard],
    data: {roles: ['admin'] }
  },
  {
  path: 'qr-generados',
  component: QrGeneradosComponent,
  canActivate: [authGuard],
  data: { roles: ['admin'] }
  },
    // 🛑 Ruta comodín para manejar 404s o rutas inexistentes
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }

];
