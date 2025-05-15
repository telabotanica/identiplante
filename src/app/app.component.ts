import {Component, effect, HostListener, inject, runInInjectionContext} from '@angular/core';
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
import {NgClass, NgIf} from "@angular/common";
import {ComparateurComponent} from "./components/comparateur/comparateur.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, LoginComponent, HeaderComponent, ContenuComponent, TopSectionComponent, MenuComponent, DetailComponent, NgIf, ComparateurComponent, NgClass],
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
  showUpIcon = false;

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
      this.selectedOnglet = this.commonService.selectedOnglet();

      // On met à jour la date de dernière consultation d'évènement de l'utilisateur
      if (this.userId != ""){
        console.log("Update last event date")
        this.authService.identite().subscribe({
          next: (data: any) => {
            this.authService.getUser(data.token)
          }
        });
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showUpIcon = scrollPosition > 80; // Afficher l'icône après un scroll de 100px
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

  scrollToTop() {
    const mainDiv = document.getElementById('main')
    if (mainDiv){
      mainDiv.scrollIntoView({ behavior: 'smooth' });
    }

  }

}
