import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import {GithubAuthProvider,GoogleAuthProvider,OAuthProvider,signInWithPopup,signOut, User} from 'firebase/auth';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  firebaseUser$: Observable<User | null>;

  constructor(private auth: Auth, private cookieService: CookieService) {
    this.firebaseUser$ = authState(this.auth);

    this.firebaseUser$.subscribe(async user => {
      if (user) {
        const token = await user.getIdToken();

        this.cookieService.setCookie(
          'firebaseToken',
          token,
          3600
        );
      } else {
        this.cookieService.deleteCookie('firebaseToken');
      }
    });
  }

  loginWithGithub() {
    const provider = new GithubAuthProvider();
    return signInWithPopup(this.auth, provider).then(async result => {

      const token = await result.user.getIdToken();
      this.cookieService.setCookie("firebaseToken",token,3600)
      return result;
    });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then(async result => {

      const token = await result.user.getIdToken();
      this.cookieService.setCookie("firebaseToken",token,3600)

      return result});
  }
  loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    return signInWithPopup(this.auth, provider).then(async result => {

      const token = await result.user.getIdToken();
      this.cookieService.setCookie("firebaseToken",token,3600)

      return result});
  }

  /**
   * Este método realiza el proceso de logout:
   * 1. Llama al endpoint de logout en el backend para invalidar la sesión.
   * 2. Limpia el estado del usuario en el servicio y en el storage.
   * Es importante que el backend maneje correctamente la invalidación de la sesión (por ejemplo, eliminando la cookie).
   * @returns 
   */
  logout() {
    return signOut(this.auth).then(() => {
      this.cookieService.deleteCookie('firebaseToken');
    });
  }

  /**
   * Llama al endpoint /me para obtener los datos del usuario actual. 
   * Se espera que el backend valide la sesión
   * y devuelva el usuario correspondiente o un error si no hay sesión válida.
   * La cookie de sesión debe ser enviada automáticamente por el navegador
   * debido a { withCredentials: true }.
   * @returns 
   */

  /** Devuelve el observable público del usuario actual */
  getCurrentUser() {
    return this.auth.currentUser;
  }
}