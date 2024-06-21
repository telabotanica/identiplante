import {Component, inject, Input} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {PopupBigImageComponent} from "../popup-big-image/popup-big-image.component";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    PopupBigImageComponent
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() obs: any;

  dateObservation = "";
  dateTransmission = "";
  popupBigImage = false;
  selectedImage: any;
  nomScientifique= '';

  commonService = inject(CommonService)

  ngOnInit(){
    this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
    this.dateTransmission = this.obs.date_transmission ? this.commonService.formatDateString(this.obs.date_transmission) : '';
    this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé'
    this.selectedImage = this.obs.images[0]
  }

  changeMainPicture(imageHref: string){
    this.selectedImage = imageHref;
  }

  openBigImage(){
    this.popupBigImage = true;
  }

  closeBigImagePopup(){
    this.popupBigImage = false;
  }

}
