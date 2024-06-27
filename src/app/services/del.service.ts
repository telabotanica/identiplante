import {inject, Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";

@Injectable({
  providedIn: 'root'
})
export class DelService {

  private protocolesService = environment.serviceBaseUrl + "protocoles";
  private ontologieService = environment.serviceBaseUrl + "ontologie/pays/";
  private observationsService = environment.serviceBaseUrl + "observations";
  private commentairesService = environment.serviceBaseUrl + "commentaires/";
  private nomsTaxonsService = environment.serviceBaseUrl + "nomstaxons";

  http = inject(HttpClient);
  router = inject(Router);
  commonService = inject(CommonService);

  constructor() { }

  getObservations(params: string, token?: string){
    let headers = new HttpHeaders();
    // Ajouter l'en-tête Authorization si le jeton est fourni
    if (token) {
      headers = headers.set('Authorization', token);
    }

    // On transforme les params page et pas en navigation.depart et navigation.limite
    params = this.commonService.mapPagination(params)

    return this.http.get<any>(this.observationsService + '?' + params, {headers});
  }

  getObservation(id: string){
    return this.http.get(this.observationsService + "/" + id)
  }

  getOntologie(){
    return this.http.get<any>(this.ontologieService);
  }

  getProtocoles(){
    return this.http.get<any>(this.protocolesService);
  }

  getVoteDetail(voteId: string, obsId: string){
    const url = this.observationsService + "/" + obsId + "/" + voteId + "/vote/";
    return this.http.get<any>(url);
  }

  saveVote(voteInfos: {obsId: string, voteId: string, user: string, value: string}, token?: string){
    const headers = token ? new HttpHeaders().set('Authorization', token) : new HttpHeaders().set('Authorization', "");

    const url = this.observationsService + "/" + voteInfos.obsId + "/" + voteInfos.voteId + "/vote/";
    const body = {utilisateur: voteInfos.user, valeur: voteInfos.value}

    return this.http.put<any>(url, body, {headers})
  }

  saveCommentaire(commentaireInfos: any, token?: string){
    const headers = token ? new HttpHeaders().set('Authorization', token) : new HttpHeaders().set('Authorization', "");

    return this.http.put<any>(this.commentairesService, commentaireInfos, {headers})
  }

  getNomsTaxons(masque: string, referentiel: string){
    return this.http.get<any>(this.nomsTaxonsService + "?masque.nom=" + masque + "&masque.referentiel=" + referentiel)
  }
}
