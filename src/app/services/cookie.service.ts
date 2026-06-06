import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class CookieService {

  setCookie(
    name: string,
    value: string,
    maxAge: number
  ) {
    document.cookie =
      `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  deleteCookie(name: string) {
    document.cookie =
      `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}