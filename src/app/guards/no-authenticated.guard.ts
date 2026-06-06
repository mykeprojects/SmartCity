import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthenticatedGuard implements  CanActivateChild {

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
