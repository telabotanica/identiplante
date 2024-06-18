import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-top-section',
  standalone: true,
  imports: [],
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.css'
})
export class TopSectionComponent {

  proposezObservationLink = environment.appliSaisieUrl + encodeURI("Ajouter une photo à déterminer");

  ngOnInit(){
    console.log(this.proposezObservationLink)
  }
}
