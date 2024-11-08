import {Component, effect, inject, input} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {forkJoin} from "rxjs";
import {Observation} from "../../models/observation";
import {Ontologie} from "../../models/ontologie";
import {Protocole} from "../../models/protocole";
import {CardComponent} from "../card/card.component";
import {PaginationComponent} from "../pagination/pagination.component";
import {CommonModule} from "@angular/common";
import {TransformDataService} from "../../services/transform-data.service";

@Component({
  selector: 'app-contenu',
  standalone: true,
  imports: [
    CardComponent,
    PaginationComponent,
    CommonModule
  ],
  templateUrl: './contenu.component.html',
  styleUrl: './contenu.component.css'
})
export class ContenuComponent {
  authService = inject(AuthService);
  commonService = inject(CommonService)
  delService = inject(DelService)
  transformDataService = inject(TransformDataService)

  userId = this.authService.userId();
  selectedOnglet = this.commonService.selectedOnglet();
  urlParamsString = this.commonService.urlParamsString();
  extendedObs = this.commonService.extendedObs();
  pays: Ontologie[] = this.commonService.paysList();
  protocoles: Protocole[] = this.commonService.protocoles()

  observations: Observation[] = [];
  observationsEntete: any;
  nbObservations = 0;
  isLoading = true;
  errorMessage = "";

  private loadObservationsInProgress = false;

  constructor() {
    this.addDefaultUrlParams()
    this.loadObservations();

    // Actions lors de la connexion / deconnexion d'un utilisateur
    effect(() => {
      const newUserId = this.authService.userId();
      if (this.userId !== newUserId) {
        this.userId = newUserId;
        if (this.selectedOnglet === 'monactivite') {
          this.errorMessage = "";
          this.loadObservations();
        }
      }
    });

    // Actions lors du changement d'onglet ou de la recherche
    effect(() => {
      const newSelectedOnglet = this.commonService.selectedOnglet();
      const newUrlParamsString = this.commonService.urlParamsString();
      if (this.selectedOnglet !== newSelectedOnglet || this.urlParamsString !== newUrlParamsString) {
        if (this.selectedOnglet !== newSelectedOnglet) {
          this.commonService.setAnyParmam('page', '1');
        }
        this.selectedOnglet = newSelectedOnglet;
        this.urlParamsString = newUrlParamsString;
        this.errorMessage = "";
        this.loadObservations();
      }
    },{allowSignalWrites: true});

    effect(() => {
      const newExtendedObs = this.commonService.extendedObs();
      if (this.extendedObs !== newExtendedObs) {
        this.extendedObs = newExtendedObs;
      }
    });

    effect(() => {
      const newPays = this.commonService.paysList();
      if (this.pays !== newPays) {
        this.pays = newPays;
      }
    });
  }

  ngOnInit(): void {
    this.loadCountryAndProtocoles()
  }

  private loadCountryAndProtocoles(){
    const getOntologie = this.delService.getOntologie();
    const getProtocoles = this.delService.getProtocoles();

    forkJoin([getOntologie, getProtocoles]).subscribe({
      next: (data) => {
        this.commonService.setPaysList(data[0])

        // On convertir les données reçu au format de notre objet
        const protocolesData = data[1]["resultats"];
        if (protocolesData && typeof protocolesData === 'object') {
          let protocoles = this.mapProtocoles(Object.values(protocolesData));
          this.commonService.setProtocoles(protocoles)
        } else {
          console.error('Expected object for protocoles data but got:', protocolesData);
          this.commonService.setProtocoles([]);
        }
      },
      error: (err) => {
        this.errorMessage = err.error.error
        this.isLoading = false;
      }
    })
  }

  private loadObservations(): void {
    // if (this.loadObservationsInProgress) {
    //   return;
    // }

    this.loadObservationsInProgress = true;
    this.isLoading = true;
    this.observations = [];
    this.observationsEntete = []
    this.nbObservations = 0;

    this.delService.getObservations(this.urlParamsString).subscribe({
      next: (data) => {
        // On converti les données reçu au format de notre objet
        const observationsData = data["resultats"];
        if (observationsData && typeof observationsData === 'object') {
          this.observations = this.mapObservations(Object.values(observationsData));

          // On remplace les photos par des + petites pour optimiser le temps de chargement
          this.observations.forEach(observation => {
            observation = this.transformDataService.replacePictureFormat(observation, "M");
          })

        } else {
          console.error('Expected object for protocoles data but got:', observationsData);
          this.observations = [];
        }

        this.observationsEntete = data["entete"];
        this.nbObservations = this.observationsEntete.total
        this.isLoading = false;
        this.loadObservationsInProgress = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadObservationsInProgress = false;
        this.errorMessage = err.error.error
      }
    });
  }

  private mapProtocoles(data: any[]): Protocole[] {
    return data.map(item => new Protocole(
      item["protocole.descriptif"],
      item["protocole.id"],
      item["protocole.identifie"],
      item["protocole.intitule"],
      item["protocole.mots_cles"],
      item["protocole.tag"]
    ));
  }

  private mapObservations(data: any[]): Observation[]{
    return data.map(item => new Observation(
      item["auteur.courriel"],
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
      item["zone_geo"]
    ))
  }

  private addDefaultUrlParams(){
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.searchParams);

    const defaultParams = {
      'masque.type': 'adeterminer',
      'page': '1',
      'pas': '12',
      'masque.pninscritsseulement': '1',
      'tri': 'date_transmission',
      'ordre': 'desc'
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
      if (!urlParams.has(key)) {
        this.commonService.setAnyParmam(key, value);
      }
    });
  }

}
