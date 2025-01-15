import {Component, EventEmitter, inject, Output} from '@angular/core';
import {Ontologie} from "../../models/ontologie";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Referentiel} from "../../models/referentiel";
import {CommonService} from "../../services/common.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-popup-advanced-search',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './popup-advanced-search.component.html',
  styleUrl: './popup-advanced-search.component.css'
})
export class PopupAdvancedSearchComponent {
  @Output() closePopupEmitter = new EventEmitter<void>()

  commonService = inject(CommonService)
  fb = inject(FormBuilder)

  paysList: Ontologie[] = this.commonService.paysList();
  form!: FormGroup;
  referentiels: Referentiel[] = [];
  useYearOnly: boolean = false;
  url = new URL(window.location.href);
  urlParams = new URLSearchParams(this.url.searchParams);
  dateValue = "";
  yearValue = "";
  pninscritsseulement = true

  ngOnInit(): void {
    this.referentiels = this.commonService.getReferentiels()
    this.checkIfDateOrYear();
    this.pninscritsseulement = this.urlParams.get('masque.pninscritsseulement') == '1' ? true : false;

    this.form = this.fb.group({
      masque: decodeURI(this.urlParams.get('masque') || '') || null,
      referentiel: decodeURI(this.urlParams.get('masque.referentiel') || '') || (this.referentiels.length ? this.referentiels[0].code : null),
      famille: decodeURI(this.urlParams.get('masque.famille') || '') || null,
      genre: decodeURI(this.urlParams.get('masque.genre') || '') || null,
      ns: decodeURI(this.urlParams.get('masque.ns') || '') || null,
      date: decodeURI(this.dateValue || '') || null,
      year: decodeURI(this.yearValue || '') || null,
      pays: decodeURI(this.urlParams.get('masque.pays') || '') || null,
      departement: decodeURI(this.urlParams.get('masque.departement') || '') || null,
      commune: decodeURI(this.urlParams.get('masque.commune') || '') || null,
      auteur: decodeURI(this.urlParams.get('masque.auteur') || '') || null,
      tag: decodeURI(this.urlParams.get('masque.tag') || '') || null,
      pninscritsseulement: this.pninscritsseulement
    });
  }

  onSubmit() {
    let formData = this.form.value;
    formData = this.transformFormData(formData)

    Object.entries(formData).forEach(([key, value]) => {
      this.updateParamsInUrl(key,  value)
    });

    this.commonService.setAnyParmam('page', '1')
    this.close()
  }

  close() {
    this.closePopupEmitter.emit();
  }

  clearSearch(){
    Object.entries(this.form.value).forEach(([key, value]) => {
      value = null;
      if (key === 'masque'){
        this.commonService.deleteParam(key)
      } else if (key === 'pninscritsseulement'){
        this.commonService.setAnyParmam('masque.pninscritsseulement', "1")
      } else {
        this.commonService.deleteParam('masque.' + key);
      }
    })
    this.closePopupEmitter.emit();
  }

  transformFormData(formData: any){
    // Transformation du paramètre date
    if (this.useYearOnly && formData.year) {
      formData.date = formData.year.toString();
    } else if (formData.date) {
      formData.date = this.formatDateToString(new Date(formData.date));
    }
    // Paramètre year devient inutile car passé dans le paramètre date donc on le supprime
    delete formData.year;

    // Transformation de pnInscrit
    if (formData.pninscritsseulement == 0){
      formData.pninscritsseulement = '0'
    } else {
      formData.pninscritsseulement = '1'
    }

    return formData
  }

  updateParamsInUrl(key: string, value: any){
    let nomParametre = key === 'masque' ? key : 'masque.' + key
    if (value && typeof value === 'string' && value !== ""){ // Si on a des données
      if (key === 'referentiel' && value === 'tous'){ // Si tous les référentiels sont sélectionnés on ne veut pas de paramètre de recherche spécifique
        value = null;
        this.commonService.deleteParam(nomParametre)
      } else {
        this.commonService.setAnyParmam(nomParametre, value)
      }
    } else if(this.urlParams.get(nomParametre)) { // s'il y avait un parametre à l'ouverture et plus au submit, on efface la recherche
      this.commonService.deleteParam(nomParametre)
    }
  }

  toggleUseYearOnly() {
    this.useYearOnly = !this.useYearOnly;
    if (this.useYearOnly) {
      this.form.get('date')?.setValue(null);
    } else {
      this.form.get('year')?.setValue(null);
    }
  }

  formatDateToString(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  checkIfDateOrYear(){
    const dateParam = this.urlParams.get('masque.date');

    if (dateParam) {
      if (dateParam.length === 4 && /^\d{4}$/.test(dateParam)) {
        this.useYearOnly = true;
        this.yearValue = dateParam;
      } else {
        this.useYearOnly = false;

        // On retransforme la date au format YYYY-MM-DD pour l'affichage dans le html
        const [day, month, year] = dateParam.split('/');
        this.dateValue = `${year}-${month}-${day}`;
      }
    }
  }
}
