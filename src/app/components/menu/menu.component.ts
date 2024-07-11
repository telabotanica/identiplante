import {Component, effect, inject} from '@angular/core';
import {LoginComponent} from "../login/login.component";
import {CommonService} from "../../services/common.service";
import {AuthService} from "../../services/auth.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  commonService = inject(CommonService)
  authService = inject(AuthService);

  isMenuOpen = false;
  selectedOnglet = this.commonService.selectedOnglet();
  userId = this.authService.userId();

  baseUrl = environment.identiplanteUrl

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
      this.selectedOnglet = this.commonService.selectedOnglet()
    });
  }

  ngOnInit(): void {
    let urlParams: { name: string, value: string }[] = this.commonService.readUrlParameters()
    const masqueTypeParam = urlParams.find((param: { name: string, value: string }) => param.name === 'masque.type');
    if (masqueTypeParam) {
      this.commonService.setOnglet(masqueTypeParam.value)
      this.selectedOnglet = this.commonService.selectedOnglet();
    }
  }

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleButtonClick(onglet: string) {
    this.commonService.setOnglet(onglet)
    this.selectedOnglet = this.commonService.selectedOnglet();

    // Pour supprimer le fragment si il existe
    window.location.hash = '';

    if (this.isMenuOpen) {
      this.toggleMenu();
    }
  }
}
