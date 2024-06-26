import {Component, effect, ElementRef, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonService} from "../../services/common.service";
import {Referentiel} from "../../models/referentiel";
import {NgFor, NgIf} from "@angular/common";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user";
import {DelService} from "../../services/del.service";
import {debounceTime, distinctUntilChanged, map, of, switchMap} from "rxjs";

@Component({
  selector: 'app-popup-ajout-commentaire',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './popup-ajout-commentaire.component.html',
  styleUrl: './popup-ajout-commentaire.component.css'
})
export class PopupAjoutCommentaireComponent {
  @Output() closePopupEmitter = new EventEmitter<void>()
  @Input() obsId: any;
  @Input() commentType: any;

  fb = inject(FormBuilder)
  commonService = inject(CommonService)
  authService = inject(AuthService);
  delService = inject(DelService)
  elementRef = inject(ElementRef)

  form!: FormGroup;
  referentiels: Referentiel[] = [];
  user: User | null = this.authService.user();
  commentErrorMessage = "";
  taxonsList: any[] = [];
  skipNextValueChange = false; // Indicateur pour ignorer le prochain changement de valeur de la recherche de taxons
  showWarningPopup = false;

  constructor() {
    effect(() => {
      this.user = this.authService.user();
    });
  }

  ngOnInit(){
    this.referentiels = this.commonService.getReferentiels()
    this.referentiels.shift()

    const nom  =  (this.user && this.user.nom) ? this.user.nom : null
    const prenom =  (this.user && this.user.prenom) ? this.user.prenom : null
    const courriel =  (this.user && this.user.courriel) ? this.user.courriel : null

    if (this.commentType == 'commentaire'){
      this.form = this.fb.group({
        nom: [nom, [Validators.required]],
        prenom: [prenom, [Validators.required]],
        courriel: [courriel, [Validators.required, Validators.email]],
        texte: [null, [Validators.required]]
      })
    } else {
      this.form = this.fb.group({
        nom: [nom, [Validators.required]],
        prenom: [prenom, [Validators.required]],
        courriel: [courriel, [Validators.required, Validators.email]],
        referentiel: [this.referentiels.length ? this.referentiels[0].code : null, [Validators.required]],
        nom_sel: [null, [Validators.required]],
        texte: null,
        nom_sel_nn: null
      })
    }

    this.getTaxonsList()

    // On cache la liste si on click dans le popup
    window.addEventListener('click', this.onGlobalClick.bind(this));
  }

  confirmSubmit() {
    this.showWarningPopup = false;
    this.submitForm();
  }

  cancelSubmit() {
    this.showWarningPopup = false;
  }

  onSubmit() {
    if (this.commentType == 'determination' && !this.form.value.nom_sel_nn) {
      this.showWarningPopup = true; // Affiche la popup de confirmation si nom_sel_nn est null dans le cas d'une proposition de détermination
    } else {
      this.submitForm(); // Soumet le formulaire directement
    }
  }

  submitForm() {
    interface FormData {
      "auteur.nom": string;
      "auteur.prenom": string;
      "auteur.courriel": string;
      observation: any;
      auteur_id: string;
      texte: any;
      nom_referentiel: string;
      nom_sel: string;
      nom_sel_nn: string;
    }

    let formData: FormData = {
      "auteur.nom": this.form.value.nom,
      "auteur.prenom": this.form.value.prenom,
      "auteur.courriel": this.form.value.courriel,
      observation: this.obsId,
      auteur_id : "",
      texte: this.form.value.texte,
      nom_referentiel: "",
      nom_sel: "",
      nom_sel_nn: ""
    }

    // On ajoute les infos supplémentaire pour le cas d'une proposition de détermination
    if (this.commentType == 'determination'){
      formData.nom_referentiel = this.form.value.referentiel
      formData.nom_sel = this.form.value.nom_sel

      if (this.form.value.nom_sel_nn){
        formData.nom_sel_nn = this.form.value.nom_sel_nn
      }
    }

    if (this.user){
      formData.auteur_id = this.user.id_utilisateur
    }

    if (this.form.valid){
      formData = this.removeEmptyProperties(formData) as FormData;

      // Envoie vers le web service
      if (!this.user){
        this.delService.saveCommentaire(formData).subscribe({
          next: (data) => {
            console.log(data)
            this.close()
            location.reload()
          },
          error: (err) => {
            console.log(err)
          }
        })
      } else {
        this.authService.identite().subscribe({
          next: (data) => {
            const token = data.token ?? "";
            this.delService.saveCommentaire(formData, token).subscribe({
              next: (data) => {
                console.log(data)
                this.close()
                location.reload()
              },
              error: (err) => {
                console.log(err.error)
                this.commentErrorMessage = "Un problème est survenu, veuillez vous reconnecter."
              }
            })
          },
          error: (err) => {
            console.log(err.error.error)
            this.commentErrorMessage = "Un problème est survenu, veuillez vous reconnecter."
          }
        })
      }

      this.close()
      location.reload()
    }
  }

  // Clean l'objet à envoyer au service pour ne pas avoir de paramètres vide
  removeEmptyProperties(obj: any):Partial<FormData> {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined));
  }

  // Ferme le popup
  close() {
    this.closePopupEmitter.emit();
  }

//  Gestion de la suggestion de taxons
  getTaxonsList(){
    this.form.get('nom_sel')?.valueChanges.pipe(
      debounceTime(500), // délai de 1 seconde
      distinctUntilChanged(),
      switchMap(value => {
        // Ignorer lorsque l'input change car on a sélectionner un taxon dans la liste
        if (this.skipNextValueChange) {
          this.skipNextValueChange = false;
          return of([]);
        }

        const referentiel = this.form.get('referentiel')?.value;
        if (value && referentiel) {
          return this.getNomsTaxons(value, referentiel);
        } else {
          return of([]); // renvoie un tableau vide si aucune valeur
        }
      })
    ).subscribe(data => {
      this.taxonsList = data;
    });
  }

  //Récupération des suggestions de taxon
  getNomsTaxons(masque: string, referentiel: string) {
    return this.delService.getNomsTaxons(masque, referentiel).pipe(
      map(response => response["resultats"] || [])
    );
  }

  // Sélection du taxon voulu dans la liste de suggestions
  selectProposition(proposition: any) {
    this.skipNextValueChange = true; // Ignorer le prochain changement de valeur
    this.form.patchValue({
      nom_sel: proposition.ns,
      nom_sel_nn: proposition.nn.toString()
    });
    this.hidePropositions();
  }

  // Fermeture de la liste de suggestions de taxons
  hidePropositions() {
    this.taxonsList = [];
  }

  clearNomSelNn() {
    this.form.patchValue({
      nom_sel_nn: null
    });
  }

  // Cacher la liste de taxons au click
  onGlobalClick(event: MouseEvent) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      this.hidePropositions();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.onGlobalClick.bind(this));
  }
}
