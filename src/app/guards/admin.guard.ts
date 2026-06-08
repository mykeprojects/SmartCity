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
    return this.securityService.getUser().pipe(
      take(1),
      map((user) => {
        if (!user) {
          return this.router.createUrlTree(['/authentication/login']);
        }
        return true;
      })
    );
  }
}
