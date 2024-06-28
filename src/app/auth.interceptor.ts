import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler, HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {environment} from "../environments/environment";
import {effect, inject, Injectable, Provider} from "@angular/core";
import {AuthService} from "./services/auth.service";
import {CookieService} from "ngx-cookie-service";
import {Observable} from "rxjs";
import {User} from "./models/user";

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const cookieService = inject(CookieService);
  const cookieName = environment.cookieName;
  let user: User | null = authService.user();

  const cookie = cookieService.get(cookieName)

  if (cookie) {
    authService.identite().subscribe({
      next: (data: any) => {
        let token = data.token;

        const cloned = req.clone({
          headers: req.headers.set("Authorization",
            token)
        });
        return next(cloned);
      },
      error: (err: any) => {
        console.log(err.message)
        return next(req);
      }
    })
  } else {

    return next(req);
  }

  return next(req);
}
