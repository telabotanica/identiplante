import {Component, effect, inject, input} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {forkJoin} from "rxjs";
import {Observation} from "../../models/observation";
import {Ontologie} from "../../models/ontologie";
import {Protocole} from "../../models/protocole";
import {CardComponent} from "../card/card.component";

@Component({
  selector: 'app-contenu',
  standalone: true,
  imports: [
    CardComponent
  ],
  templateUrl: './contenu.component.html',
  styleUrl: './contenu.component.css'
})
export class ContenuComponent {
  authService = inject(AuthService);
  commonService = inject(CommonService)
  delService = inject(DelService)

  userId = this.authService.userId();
  selectedOnglet = this.commonService.selectedOnglet();
  urlParamsString = this.commonService.urlParamsString();

  observations: Observation[] = [];
  pays: Ontologie[] = [];
  protocoles: Protocole[] = []
  observationsEntete: any;
  nbObservations = 0;
  isLoading = true;
  errorMessage = "";

  constructor() {
    // Actions lors de la connexion / deconnexion d'un utilisateur
    effect(() => {
      this.userId = this.authService.userId();
      if (this.selectedOnglet == 'monactivite'){
        this.errorMessage = "";
        this.loadObservations();
      }
    });

    // Actions lors du changement d'onglet ou de la recherche
    effect(()=> {
      this.selectedOnglet = this.commonService.selectedOnglet();
      this.urlParamsString = this.commonService.urlParamsString();
      this.errorMessage = "";
      this.loadObservations();
    })
  }

  ngOnInit(): void {
    this.loadCountryAndProtocoles()
  }

  private loadCountryAndProtocoles(){
    const getOntologie = this.delService.getOntologie();
    const getProtocoles = this.delService.getProtocoles();

    forkJoin([getOntologie, getProtocoles]).subscribe({
      next: (data) => {
        this.pays = data[0]

        // On convertir les données reçu au format de notre objet
        const protocolesData = data[1]["resultats"];
        if (protocolesData && typeof protocolesData === 'object') {
          this.protocoles = this.mapProtocoles(Object.values(protocolesData));
        } else {
          console.error('Expected object for protocoles data but got:', protocolesData);
          this.protocoles = [];
        }
      },
      error: (err) => {
        this.errorMessage = err.error.error
        this.isLoading = false;
      }
    })
  }

  private loadObservations(): void {
    this.isLoading = true;
    this.observations = [];
    this.observationsEntete = []
    this.nbObservations = 0;

    if (this.userId && this.selectedOnglet == 'monactivite'){
      /*
      * Si l'utilisateur est connecté on récupère un token avec le service identité
      * puis on récupère les obs avec ce token dans le header authorization
      * pour avoir les obs de monactivite
       */
      this.authService.identite().subscribe( {
        next: (data) => {
          let token = data.token;
          this.delService.getObservations(this.urlParamsString, token).subscribe( {
            next: (data) => {
              // On convertir les données reçu au format de notre objet
              const observationsData = data["resultats"];
              if (observationsData && typeof observationsData === 'object') {
                this.observations = this.mapObservations(Object.values(observationsData));
              } else {
                console.error('Expected object for protocoles data but got:', observationsData);
                this.observations = [];
              }

              this.observationsEntete = data["entete"];
              this.nbObservations = this.observationsEntete.total
              this.isLoading = false;
            },
            error:(err) => {
              this.errorMessage = err.error.error
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur: veuillez vous reconnecter'
        }

      })
    } else {
      // Si l'utilisateur n'est pas connecté, on va récupérer les obs sans header authorization
      this.delService.getObservations(this.urlParamsString).subscribe({
        next: (data) => {
          // On convertir les données reçu au format de notre objet
          const observationsData = data["resultats"];
          if (observationsData && typeof observationsData === 'object') {
            this.observations = this.mapObservations(Object.values(observationsData));
          } else {
            console.error('Expected object for protocoles data but got:', observationsData);
            this.observations = [];
          }

          this.observationsEntete = data["entete"];
          this.nbObservations = this.observationsEntete.total
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.error
        }
      });
    }
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
}
