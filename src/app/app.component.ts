import {Component, effect, inject, runInInjectionContext} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {FooterComponent} from "./components/footer/footer.component";
import {LoginComponent} from "./components/login/login.component";
import {HeaderComponent} from "./components/header/header.component";
import {AuthService} from "./services/auth.service";
import {ContenuComponent} from "./components/contenu/contenu.component";
import {TopSectionComponent} from "./components/top-section/top-section.component";
import {MenuComponent} from "./components/menu/menu.component";
import {CommonService} from "./services/common.service";
import {DetailComponent} from "./components/detail/detail.component";
import {NgIf} from "@angular/common";
import {ComparateurComponent} from "./components/comparateur/comparateur.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, LoginComponent, HeaderComponent, ContenuComponent, TopSectionComponent, MenuComponent, DetailComponent, NgIf, ComparateurComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'identiplante';

  authService = inject(AuthService);
  commonService = inject(CommonService)
  route = inject(ActivatedRoute)

  userId = this.authService.userId();
  selectedOnglet = this.commonService.selectedOnglet();
  isDetail = false;
  isComparateur = false;

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
      this.selectedOnglet = this.commonService.selectedOnglet();
    });
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('obs~')) {
        this.isDetail = true;
      } else {
        this.isDetail = false;
      }

      if (fragment && fragment.startsWith('comparateur')) {
        this.isComparateur = true;
      } else {
        this.isComparateur = false;
      }
    });
  }

}
