import {inject, Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class DelService {

  private protocolesService = environment.serviceBaseUrl + "protocoles";
  private ontologieService = environment.serviceBaseUrl + "ontologie/pays/";
  private observationsService = environment.serviceBaseUrl + "observations";

  http = inject(HttpClient)
  router = inject(Router)

  constructor() { }

  getObservations(params: string, token?: string){
    let headers = new HttpHeaders();
    // Ajouter l'en-tête Authorization si le jeton est fourni
    if (token) {
      headers = headers.set('Authorization', token);
    }
    
    return this.http.get<any>(this.observationsService + params, {headers});
  }

  getOntologie(){
    return this.http.get<any>(this.ontologieService);
  }

  getProtocoles(){
    return this.http.get<any>(this.protocolesService);
  }
}
