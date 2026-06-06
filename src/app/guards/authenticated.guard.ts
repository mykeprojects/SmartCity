import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { take, map } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements  CanActivateChild {

  constructor(private securityService: SecurityService,
    private router: Router
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("Autenticación verificando")
    return this.securityService.getUser().pipe(
      take(1),
      map(user=>
        user? true
            : this.router.createUrlTree(['/authentication/login'])
      )
    )
  }
}
