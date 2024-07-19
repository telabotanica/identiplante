import {Injectable, signal} from '@angular/core';
import {Referentiel} from "../models/referentiel";
import {Observation} from "../models/observation";
import {Ontologie} from "../models/ontologie";
import {Protocole} from "../models/protocole";

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  selectedOnglet = signal("");
  url = new URL(window.location.href)
  urlParamsString = signal(this.url.search)
  extendedObs = signal<string[]>([]);
  obsAComparer = signal<any>([]);
  comparerImage = signal("")
  paysList = signal<Ontologie[]>([])
  protocoles = signal<Protocole[]>([])

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

  formatDateAndTimeString(dateString: string): string {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year} à ${timePart}`;
  }

  mapObservation(item: any): Observation{
    return new Observation(item["auteur.courriel"],
      item["auteur.id"],
      item["auteur.nom"],
      item["commentaires"],
      item["date_observation"],
      item["date_transmission"],
      item["determination.famille"],
      item["determination.nn"],
      item["determination.ns"],
      item["determination.nt"],
      item["determination.referentiel"],
      item["hauteur"],
      item["id_image"],
      item["id_observation"],
      item["id_zone_geo"],
      item["images"],
      item["largeur"],
      item["mots_cles_texte"],
      item["nb_commentaires"],
      item["nom_original"],
      item["pays"],
      item["station"],
      item["zone_geo"])
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

  resetExtendedObs(){
    this.extendedObs.set([]);
  }

  setObsAComparer(obs: any){
    this.obsAComparer.set(obs)
  }

  setComparerImage(masque: string){
    this.comparerImage.set(masque)
  }

  deleteVotesDuplicate(votesArray: []){
    // Regrouper les votes par auteur.id
    const groupedVotes: { [key: string]: any[] } = votesArray.reduce((acc: any, vote: any) => {
      if (!acc[vote['auteur.id']]) {
        acc[vote['auteur.id']] = [];
      }
      acc[vote['auteur.id']].push(vote);
      return acc;
    }, {});

    // Conserver le vote avec le plus grand vote.id pour chaque auteur.id
    const filteredVotes: any[] = Object.values(groupedVotes).map((votes: any[]) => {
      return votes.reduce((maxVote, vote) => {
        return parseInt(vote['vote.id'], 10) > parseInt(maxVote['vote.id'], 10) ? vote : maxVote;
      });
    });

    return filteredVotes
  }

  calculerScoreVotes(vote: any, score: number){
    let scoreValue = 3;

    if (!vote['auteur.courriel']){ // Si le vote est anonyme
      scoreValue = 1
    }

    if (vote.vote == "1"){
      score += scoreValue
    } else {
      score -= scoreValue
    }

    return score;
  }

  sortObsBy(tri: string){
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.searchParams);
    let ordre = "";

    const existingOrder = urlParams.get('ordre');
    const existingTri = urlParams.get('tri');

    if (existingTri == tri){
      ordre = existingOrder == 'desc' ? 'asc' : 'desc';
    } else {
      ordre = 'desc'
    }

    this.setAnyParmam("tri", tri)
    this.setAnyParmam("ordre", ordre)
  }

  setPaysList(list: Ontologie[]){
    this.paysList.set(list)
  }

  setProtocoles(protocoles: Protocole[]){
    this.protocoles.set(protocoles)
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/pasdephoto.jpg';
  }

  scrollImages(imageCarousel: any) {
    if (imageCarousel) {
      const carousel = imageCarousel.nativeElement;
      const scrollWidth = carousel.scrollWidth - ((115+20)*3); // Total width including cloned images
      carousel.scrollTo({
        left: carousel.scrollLeft + 145,
        behavior: 'smooth'
      });
      // Reset to the beginning if scrolled past the total width
      if (carousel.scrollLeft >= scrollWidth) {
        carousel.scrollTo({
          left: 0,
          behavior: 'auto'
        });
      }
    }
  }

  getVoteIconSrc(type: 'like' | 'dislike', commentaire: any, isHovered: any): string {
    if (type === 'like') {
      if (commentaire.length == 0){
        if (isHovered.like) {
          return 'assets/icons/like_inactif_hover.png'
        } else {
          return 'assets/icons/like_inactif.png'
        }
      }

      if (commentaire.isHoveredLike) {
        return commentaire.userVote === '1' ? 'assets/icons/like_actif_hover.png' : 'assets/icons/like_inactif_hover.png';
      } else {
        return commentaire.userVote === '1' ? 'assets/icons/like_actif.png' : 'assets/icons/like_inactif.png';
      }
    } else if (type === 'dislike') {
      if (commentaire.length == 0){
        if (isHovered.dislike) {
          return 'assets/icons/dislike_inactif_hover.png'
        } else {
          return 'assets/icons/dislike_inactif.png'
        }
      }

      if (commentaire.isHoveredDislike) {
        return commentaire.userVote === '0' ? 'assets/icons/dislike_actif_hover.png' : 'assets/icons/dislike_inactif_hover.png';
      } else {
        return commentaire.userVote === '0' ? 'assets/icons/dislike_actif.png' : 'assets/icons/dislike_inactif.png';
      }
    }
    return '';
  }

  changeIconOnHover(type: 'like' | 'dislike', commentaire: any, isHovering: boolean): void {
    if (type === 'like') {
      commentaire.isHoveredLike = isHovering;
    } else if (type === 'dislike') {
      commentaire.isHoveredDislike = isHovering;
    }
  }

  changeIconOnHoverSimple(type: 'like' | 'dislike', isHovering: boolean, isHovered: any): void {
    if (type === 'like') {
      isHovered.like = isHovering;
    } else if (type === 'dislike') {
      isHovered.dislike = isHovering;
    }
  }

}
