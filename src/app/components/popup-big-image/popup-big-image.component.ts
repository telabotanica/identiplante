import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Observation} from "../../models/observation";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-popup-big-image',
  standalone: true,
  imports: [],
  templateUrl: './popup-big-image.component.html',
  styleUrl: './popup-big-image.component.css'
})
export class PopupBigImageComponent {
  @Output() closePopupEmitter = new EventEmitter<void>()
  @Input() obs: any;
  @Input() selectedImage: any;

  dateTransmission = "";
  nomScientifique= '';

  commonService = inject(CommonService)

  ngOnInit(){
    this.dateTransmission = this.obs.date_transmission ? this.commonService.formatDateString(this.obs.date_transmission) : '';
    this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé'
  }

  close() {
    this.closePopupEmitter.emit();
  }
}
