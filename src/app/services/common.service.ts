import {Injectable, signal} from '@angular/core';
import {Referentiel} from "../models/referentiel";
import {Observation} from "../models/observation";

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  selectedOnglet = signal("");
  url = new URL(window.location.href)
  urlParamsString = signal(this.url.search)
  extendedObs = signal<string[]>([]);

  constructor() { }

  readUrlParameters(): { name: string, value: string }[] {
    const urlParams: { name: string, value: string }[] = [];

    const queryString = decodeURIComponent(window.location.search.substring(1));
    const parts = queryString.split('&');

    for (const part of parts) {
      const [paramName, paramValue] = part.split('=');

      urlParams.push({ name: paramName, value: paramValue });
    }

    return urlParams;
  }

  setOnglet(onglet: string) {
    this.selectedOnglet.set(onglet);
    this.setAnyParmam('masque.type', onglet)
  }

  setAnyParmam(param: string, value: string){
    this.updateUrlParameter(param, value);
    let url = new URL(window.location.href)
    this.setUrlParamsString(url.search)
  }

  deleteParam(param: string) {
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    if (urlParams.has(param)) {
      url.searchParams.delete(param)
      urlParams.delete(param);
      this.setUrlParamsString(urlParams.toString());
      window.history.replaceState({}, '', url.toString());
    }
  }

  private updateUrlParameter(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.toString());
  }

  setUrlParamsString(params: string){
    this.urlParamsString.set(params)
  }

  formatDateString(dateString: string): string {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  mapPagination(params: any){
    const urlParams = new URLSearchParams(params);
    const page = urlParams.get('page');
    let pas = urlParams.get('pas');

    if (!pas){
      pas = '12';
    } else {
      urlParams.set('navigation.limite', pas);
      urlParams.delete('pas');
    }

    if (page) {
      const pageNumber = parseInt(page, 10);
      if (pageNumber <= 1) {
        urlParams.set('navigation.depart', '0');
      } else {
        const pasNumber = parseInt(pas, 10);
        const depart = (pageNumber - 1) * pasNumber;
        urlParams.set('navigation.depart', depart.toString());
      }
      urlParams.delete('page');
    }

    const newParams = urlParams.toString();

    return newParams;

  }

  getReferentiels(){
    return [
      new Referentiel("tous", "Tous les référentiels"),
      new Referentiel("bdtfx", "France métropolitaine (BDTFX)"),
      new Referentiel("bdtxa", "Antilles françaises (BDTXA)"),
      new Referentiel("bdtre", "la Réunion (BDTRE)"),
      new Referentiel("aublet", "Guyane (AUBLET2)"),
      new Referentiel("florical", "Nouvelle-Calédonie (FLORICAL)"),
      new Referentiel("isfan", "Afrique du Nord (ISFAN)"),
      new Referentiel("apd", "Afrique tropicale (APD)"),
      new Referentiel("lbf", "Liban (LEF)"),
      new Referentiel("taxreflich", "Lichens (TaxRef)"),
      new Referentiel("taxref", "France (TaxRef)")
    ];
  }

  setExtendedObs(id: string){
    let extendedObsArray = this.extendedObs();
    extendedObsArray.push(id)
    this.extendedObs.set(extendedObsArray);
  }

  reduceExtendedObs(id: string){
    let extendedObsArray = this.extendedObs();
    extendedObsArray = extendedObsArray.filter(obsId => obsId !== id);
    this.extendedObs.set(extendedObsArray);
  }

}
