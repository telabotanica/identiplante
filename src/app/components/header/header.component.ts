import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {LoginComponent} from "../login/login.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  baseUrl = environment.identiplanteUrl
}
