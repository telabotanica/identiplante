import {Component, effect, inject, input} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {forkJoin} from "rxjs";
import {Observation} from "../../models/observation";
import {Ontologie} from "../../models/ontologie";
import {Protocole} from "../../models/protocole";

@Component({
  selector: 'app-contenu',
  standalone: true,
  imports: [],
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
  isLoading = true;
  errorMessage = "";

  constructor() {
    // Actions lors de la connexion / deconnexion d'un utilisateur
    effect(() => {
      this.userId = this.authService.userId();
      if (this.selectedOnglet == 'monactivite'){
        this.loadObservations();
      }
    });

    // Actions lors du changement d'onglet ou de la recherche
    effect(()=> {
      this.selectedOnglet = this.commonService.selectedOnglet();
      this.urlParamsString = this.commonService.urlParamsString();
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
        this.protocoles = data[1]["resultats"];
      },
      error: (err) => {
        this.errorMessage = err.error.error
        this.isLoading = false;
      }
    })
  }

  private loadObservations(): void {
    this.isLoading = true;

    if (this.userId){
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
              this.observations = data["resultats"];
              this.observationsEntete = data["entete"];
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
          this.errorMessage = err.error.error
        }

      })
    } else {
      // Si l'utilisateur n'est pas connecté, on va récupérer les obs sans header authorization
      this.delService.getObservations(this.urlParamsString).subscribe({
        next: (data) => {
          this.observations = data["resultats"];
          this.observationsEntete = data["entete"];
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.error
        }
      });
    }
  }
}
