import {inject, Injectable, signal} from '@angular/core';
import { environment } from '../../environments/environment';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {CookiesService} from "./cookies.service";
import {User} from "../models/user";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = environment.serviceAuthBaseUrl;
  private delUser = environment.serviceUtilisateursBaseUrl;
  userId = signal("");
  user = signal<User | null>(null);

  http = inject(HttpClient)
  router = inject(Router)

  cookieService = inject(CookieService);
  cookieName = environment.cookieName;
  cookie = this.cookieService.get(this.cookieName)

  login(username: any, password: any) {
    return this.http.get<any>(this.authUrl + 'connexion?login=' + username + '&password=' + password)
  }

  getUser(token: string){
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get<any>(this.delUser + 'utilisateurs/', {headers})
  }

  logout(){
    return this.http.get<any>(this.authUrl + 'deconnexion')
  }

  identite(){
    return this.http.get<any>(this.authUrl + 'identite')
  }

  setUserId(id: string) {
    this.userId.set(id);
  }

  setUser(user: any){
    this.user.set(user)
  }

  isVerificateur(){
    const user: User | null = this.user();
    if (user === null) {
      return false;
    }

    switch (user.admin){
      case '0':
        return false;
      case '1':
      case '2':
        return true;
      default:
        return false
    }
  }

  isAdmin(){
    const user: User | null = this.user();
    if (user === null) {
      return false;
    }

    switch (user.admin){
      case '0':
      case '1':
        return false;
      case '2':
        return true;
      default:
        return false
    }
  }

  getAuthHeader(): Observable<HttpHeaders> {
    let headers = new HttpHeaders();

    return new Observable(observer => {
      if (this.cookie) {
        this.identite().subscribe({
          next: (data: any) => {
            let token = data.token;
            headers = headers.set("Authorization", token);
            observer.next(headers);
            observer.complete();
          },
          error: (err: any) => {
            console.log(err.message);
            observer.error(err);
          }
        });
      } else {
        observer.next(headers);
        observer.complete();
      }
    });
  }


}
