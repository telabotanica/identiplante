import {Component, EventEmitter, inject, Output} from '@angular/core';
import {DelService} from "../../services/del.service";
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

  delService = inject(DelService)
  commonService = inject(CommonService)
  fb = inject(FormBuilder)

  paysList: Ontologie[] = [];
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

    this.delService.getOntologie().subscribe({
      next: (data) => {
        this.paysList = data
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onSubmit() {
    let formData = this.form.value;

    if (this.useYearOnly && formData.year) {
      formData.date = formData.year.toString();
    } else if (formData.date) {
      formData.date = this.formatDateToString(new Date(formData.date));
    }
    delete formData.year;

    if (formData.pninscritsseulement == 0){
      formData.pninscritsseulement = '0'
    } else {
      formData.pninscritsseulement = '1'
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value !== ""){
        if (key === 'masque'){
          this.commonService.setAnyParmam(key, encodeURI(value))
        } else if (key === 'referentiel' && value === 'tous'){
          value = null;
          this.commonService.deleteParam('masque.' + key)
        } else {
          this.commonService.setAnyParmam('masque.' + key, encodeURI(value))
        }

      } else if(this.urlParams.get('masque.' + key)) { // s'il y avait un parametre à l'ouverture et plus au submit, on efface la recherche
        this.commonService.deleteParam('masque.' + key)
      } else if (this.urlParams.get(key)){ // s'il y avait une recherche libre et plus au submit, on efface la recherche
        this.commonService.deleteParam(key)
      }
    });

    this.commonService.setAnyParmam('page', '1')
    this.close()
  }

  checkParamStatus(key: string, value: string){

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
