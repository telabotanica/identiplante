import {inject, Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {CookieService} from "ngx-cookie-service";
import {AuthService} from "./auth.service";
import {switchMap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DelService {

  private protocolesService = environment.oldServiceBaseUrl + "protocoles";
  private ontologieService = environment.serviceBaseUrl + "ontologie/pays";
  private observationsService = environment.serviceBaseUrl + "observations";
  private commentairesService = environment.serviceBaseUrl + "commentaires/";
  private nomsTaxonsService = environment.oldServiceBaseUrl + "nomstaxons";
  private determinationsService = environment.serviceBaseUrl + "determinations/valider-determination/";
  private imagesService = environment.serviceBaseUrl + "images";

  http = inject(HttpClient);
  router = inject(Router);
  commonService = inject(CommonService);
  cookieService = inject(CookieService);
  authService = inject(AuthService);

  cookieName = environment.cookieName;
  cookie = this.cookieService.get(this.cookieName)

  constructor() { }

  getObservations(params: string, token?: string) {
    params = this.commonService.mapPagination(params);

    if (this.commonService.selectedOnglet() == 'monactivite'){
      let headers = new HttpHeaders();
      if (this.cookie) {
        return this.authService.getAuthHeader().pipe(
          switchMap((authHeaders: HttpHeaders) => {
            headers = authHeaders;
            return this.http.get<any>(this.observationsService + '?' + params, { headers });
          })
        );
      } else {
        return this.http.get<any>(this.observationsService + '?' + params);
      }
    } else {
      return this.http.get<any>(this.observationsService + '?' + params);
    }
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
    const url = this.observationsService + "/vote/proposition/" + obsId + "/" + voteId;
    return this.http.get<any>(url);
  }

  saveVote(voteInfos: {obsId: string, voteId: string, user: string, value: string}){
    const url = this.observationsService + "/" + voteInfos.obsId + "/" + voteInfos.voteId + "/vote";
    const body = {utilisateur: voteInfos.user, valeur: voteInfos.value}

    let headers = new HttpHeaders();
    if (this.cookie) {
      return this.authService.getAuthHeader().pipe(
        switchMap((authHeaders: HttpHeaders) => {
          headers = authHeaders;
          return this.http.put<any>(url, body, {headers})
        })
      );
    } else {
      return this.http.put<any>(url, body, {headers})
    }
  }

  saveCommentaire(commentaireInfos: any){
    let headers = new HttpHeaders();
    if (this.cookie) {
      return this.authService.getAuthHeader().pipe(
        switchMap((authHeaders: HttpHeaders) => {
          headers = authHeaders;
          return this.http.put<any>(this.commentairesService, commentaireInfos, {headers})
        })
      );
    } else {
      return this.http.put<any>(this.commentairesService, commentaireInfos, {headers})
    }

  }

  deleteComment(id: string){
    let headers = new HttpHeaders();
    if (this.cookie) {
      return this.authService.getAuthHeader().pipe(
        switchMap((authHeaders: HttpHeaders) => {
          headers = authHeaders;
          return this.http.delete(this.commentairesService + id, {headers})
        })
      );
    } else {

    }
    return this.http.delete(this.commentairesService + id, {headers})
  }

  getNomsTaxons(masque: string, referentiel: string){
    return this.http.get<any>(this.nomsTaxonsService + "?masque.nom=" + masque + "&masque.referentiel=" + referentiel)
  }

  validerProposition(commentaireId: string, validationInfos: any){
    let headers = new HttpHeaders();
    if (this.cookie) {
      return this.authService.getAuthHeader().pipe(
        switchMap((authHeaders: HttpHeaders) => {
          headers = authHeaders;
          return this.http.post(this.determinationsService + commentaireId, validationInfos, {headers})
        })
      );
    } else {
      headers = headers.set("Authorization", this.authService.token());
      return this.http.post(this.determinationsService + commentaireId, validationInfos, {headers})
    }

  }

  depublier(obsId: string){
    let headers = new HttpHeaders();
    if (this.cookie) {
      return this.authService.getAuthHeader().pipe(
        switchMap((authHeaders: HttpHeaders) => {
          headers = authHeaders;
          return this.http.post(this.observationsService + "/" + obsId, {transmission:0}, {headers})
        })
      );
    } else {
      return this.http.post(this.observationsService + "/" + obsId, {transmission:0}, {headers})
    }

  }

  getImages(search: string, depart = 1, limite = 9){
    const url = this.imagesService + "?navigation.depart=" + depart + "&navigation.limite=" + limite + "&masque.pninscritsseulement=0&masque.ns=" + search
    return this.http.get(url)
  }
}
