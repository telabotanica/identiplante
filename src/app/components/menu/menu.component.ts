import {Component, effect, inject, OnInit} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {AuthService} from "../../services/auth.service";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-menu',
    imports: [],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  commonService = inject(CommonService)
  authService = inject(AuthService);

  isMenuOpen = false;
  selectedOnglet = this.commonService.selectedOnglet();
  userId = this.authService.userId();

  baseUrl = environment.identiplanteUrl
  logoTelaSrc = 'assets/img/logos/logo_tela.png';
  logoPnSrc = 'assets/img/logos/logo_pn.png';

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
      this.selectedOnglet = this.commonService.selectedOnglet()
    });
  }

  ngOnInit(): void {
    const urlParams: { name: string, value: string }[] = this.commonService.readUrlParameters()
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

  onMouseOver(logo: string): void {
    if (logo === 'tela') {
      this.logoTelaSrc = 'assets/img/logos/logo_tela_hover.png';
    } else if (logo === 'pn') {
      this.logoPnSrc = 'assets/img/logos/logo_pn_hover.png';
    }
  }

  onMouseOut(logo: string): void {
    if (logo === 'tela') {
      this.logoTelaSrc = 'assets/img/logos/logo_tela.png';
    } else if (logo === 'pn') {
      this.logoPnSrc = 'assets/img/logos/logo_pn.png';
    }
  }
}
