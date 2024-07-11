import {Component, effect, inject} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {environment} from "../../../environments/environment";
import {PopupBigImageComponent} from "../popup-big-image/popup-big-image.component";

@Component({
  selector: 'app-comparateur',
  standalone: true,
  imports: [PopupBigImageComponent,],
  templateUrl: './comparateur.component.html',
  styleUrl: './comparateur.component.css'
})
export class ComparateurComponent {
  commonService = inject(CommonService)
  delService = inject(DelService)

  obs = this.commonService.obsAComparer();
  comparerImage = this.commonService.comparerImage();
  urlParamsString = this.commonService.urlParamsString();

  imagesList = [];
  dateObservation = "";
  nomScientifique= '';
  imageSelected: any;
  isLoading = true;
  departement = "";
  profilUrl = "";
  popupBigImage = false;

  ngOnInit(){
    this.delService.getImages(this.comparerImage).subscribe({
      next: (data: any) => {
        this.imagesList = data["resultats"]

        this.departement = this.obs.id_zone_geo ? this.obs.id_zone_geo.slice(0,2) : "";
        this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
        this.nomScientifique = this.obs["determination_ns"] ?? 'Indéterminé';
        this.profilUrl = this.obs['auteur_id'] ? environment.profilUrl + this.obs['auteur_id'] : "";
        this.imageSelected = this.obs.images ? this.obs.images[0]: [];

        // console.log(this.obs)
        // console.log(this.imagesList)
      },
      error: (err) => {
        console.error(err)
      }
    })

  }

  openBigImage(){
    this.popupBigImage = true;
  }

  closeBigImagePopup(){
    this.popupBigImage = false;
  }

}
