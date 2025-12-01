import {Component, effect, inject, OnInit} from '@angular/core';
import { environment } from '../../../environments/environment';
import {SearchBarComponent} from "../search-bar/search-bar.component";
import {ActivatedRoute} from "@angular/router";
import {CommonService} from "../../services/common.service";

@Component({
    selector: 'app-top-section',
    imports: [
        SearchBarComponent
    ],
    templateUrl: './top-section.component.html',
    styleUrl: './top-section.component.css'
})
export class TopSectionComponent implements OnInit {
  route = inject(ActivatedRoute)
  commonService = inject(CommonService)

  proposezObservationLink = environment.appliSaisieUrl + encodeURI("Ajouter une photo à déterminer");
  isDetail = false;
  urlParamsString = this.commonService.urlParamsString();


  constructor() {
    effect(()=> {
      this.urlParamsString = this.commonService.urlParamsString();
    })
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('obs~')) {
        this.isDetail = true;
      } else {
        this.isDetail = false;
      }
    });
  }
}
