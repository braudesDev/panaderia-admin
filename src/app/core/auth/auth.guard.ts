import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const estaLogueado = authService.estaAutenticado();
  const rolUsuario = authService.getRol();

  if (!estaLogueado) {
    router.navigate(['/auth/login']);
    return false;
  }

  const rolesPermitidos: string[] = route.data['roles'] ?? [];
  if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario!)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
