import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import {SearchBarComponent} from "../search-bar/search-bar.component";

@Component({
  selector: 'app-top-section',
  standalone: true,
  imports: [
    SearchBarComponent
  ],
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.css'
})
export class TopSectionComponent {

  proposezObservationLink = environment.appliSaisieUrl + encodeURI("Ajouter une photo à déterminer");

}
