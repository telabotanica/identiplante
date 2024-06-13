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

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
    });

    effect(()=> {
      this.selectedOnglet = this.commonService.selectedOnglet();
      this.urlParamsString = this.commonService.urlParamsString();
      this.loadObservations();
    })
  }

  private loadObservations(): void {
    this.isLoading = true;
    const getObservations = this.delService.getObservations(this.urlParamsString);
    const getOntologie = this.delService.getOntologie();
    const getProtocoles = this.delService.getProtocoles();

    forkJoin([getOntologie, getProtocoles, getObservations]).subscribe({
      next: (data) => {
        this.pays = data[0]
        this.protocoles = data[1]["resultats"];
        this.observations = data[2]["resultats"];
        this.observationsEntete = data[2]["entete"];
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err.message)
        this.isLoading = false;
      }
    })
  }
}
