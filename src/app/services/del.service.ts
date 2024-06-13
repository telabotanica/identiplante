import {inject, Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient} from "@angular/common/http";
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

  getObservations(params: string){
    return this.http.get<any>(this.observationsService + params);
  }

  getOntologie(){
    return this.http.get<any>(this.ontologieService);
  }

  getProtocoles(){
    return this.http.get<any>(this.protocolesService);
  }
}
