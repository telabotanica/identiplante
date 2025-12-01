import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {LoginComponent} from "../login/login.component";

@Component({
    selector: 'app-header',
    imports: [LoginComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
  showDescriptionText = false;
  baseUrl = environment.identiplanteUrl

  showDescription(){
    this.showDescriptionText = true;
  }

  hideDescription(){
    this.showDescriptionText = false;
  }
}
