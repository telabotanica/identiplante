import {inject, Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {CookiesService} from "./cookies.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = environment.serviceAuthBaseUrl;
  private delUser = environment.serviceUtilisateursBaseUrl;

  http = inject(HttpClient)
  router = inject(Router)

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

}
