import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  selectedOnglet = signal("");
  url = new URL(window.location.href)
  urlParamsString = signal(this.url.search)

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
    this.updateUrlParameter('masque.type', onglet);

    let url = new URL(window.location.href)
    this.setUrlParamsString(url.search)
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
}
