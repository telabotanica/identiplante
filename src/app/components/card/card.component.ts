import {Component, inject, Input} from '@angular/core';
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() obs: any;

  dateObservation = "";
  dateTransmission = "";

  commonService = inject(CommonService)

  ngOnInit(){
    this.dateObservation = this.commonService.formatDateString(this.obs.date_observation)
    this.dateTransmission = this.commonService.formatDateString(this.obs.date_transmission)
    console.log(this.obs)
  }
}
