import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  Auth as FirebaseAuth,
} from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { CookieService } from './cookie.service';
import { environment } from 'src/environments/environments';
import { CitizenService } from './territorial/citizen.service';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private firebaseUser$: Observable<User | null>;
  private secondaryAuth?: FirebaseAuth;
  private readonly secondaryAppName = 'user-registration';

  constructor(private auth: Auth, private cookieService: CookieService, private citizenService: CitizenService) {
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
  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async result => {

        const token = await result.user.getIdToken();
        this.cookieService.setCookie('firebaseToken', token, 3600);

        return result;
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

  updateDisplayName(displayName: string) {
    const user = this.auth.currentUser;
    if (!user) {
      return Promise.reject(new Error('No hay sesión activa.'));
    }
    return updateProfile(user, { displayName: displayName.trim() });
  }

  /**
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
   * Crea un usuario en Firebase sin cerrar la sesión del administrador actual.
   */
  registerUser(email: string, password: string, displayName?: string) {
    const secondaryAuth = this.getSecondaryAuth();
    return createUserWithEmailAndPassword(secondaryAuth, email, password).then(async (result) => {
      if (displayName?.trim()) {
        await updateProfile(result.user, { displayName: displayName.trim() });
      }
      await signOut(secondaryAuth);
      return result;
    });
  }

  /**
   * Elimina un usuario recién creado en Firebase si falla el registro en el backend.
   */
  deleteRegisteredUser(email: string, password: string) {
    const secondaryAuth = this.getSecondaryAuth();
    return signInWithEmailAndPassword(secondaryAuth, email, password)
      .then((result) => deleteUser(result.user))
      .finally(() => signOut(secondaryAuth));
  }

  private getSecondaryAuth(): FirebaseAuth {
    if (!this.secondaryAuth) {
      const existingApp = getApps().find((app) => app.name === this.secondaryAppName);
      const app = existingApp ?? initializeApp(environment.firebase, this.secondaryAppName);
      this.secondaryAuth = getAuth(app);
    }
    return this.secondaryAuth;
  }

  /**
   * Llama al endpoint /me para obtener los datos del usuario actual. 
   * Se espera que el backend valide la sesión
   * y devuelva el usuario correspondiente o un error si no hay sesión válida.
   * La cookie de sesión debe ser enviada automáticamente por el navegador
   * debido a { withCredentials: true }.
   * @returns 
   */

  getUser(): Observable<User | null> {
    return this.firebaseUser$;
  }

  getUserIdInBackend(): Observable<number | null> {
    return this.getUser().pipe(
      switchMap(user => {
        if (!user?.email) {
          return of(null);
        }

        return this.citizenService.getAll().pipe(
          map(citizens => {
            const citizen = citizens.find(
              citizen => citizen.email === user.email
            );

            return citizen?.id_citizen ?? null;
          })
        );
      })
    );
  }
}