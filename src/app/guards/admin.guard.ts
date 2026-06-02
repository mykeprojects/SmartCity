import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivateChild {
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  canActivateChild() {
    return this.securityService.getCurrentUser().pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(['/authentication/login']);
          return false;
        }
        const role = (user as { role?: string }).role?.toLowerCase();
        if (role && role !== 'admin' && role !== 'administrador') {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
