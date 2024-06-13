import {Component, effect, inject, runInInjectionContext} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from "./components/footer/footer.component";
import {LoginComponent} from "./components/login/login.component";
import {HeaderComponent} from "./components/header/header.component";
import {AuthService} from "./services/auth.service";
import {ContenuComponent} from "./components/contenu/contenu.component";
import {TopSectionComponent} from "./components/top-section/top-section.component";
import {MenuComponent} from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, LoginComponent, HeaderComponent, ContenuComponent, TopSectionComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'identiplante';

  authService = inject(AuthService);
  userId = this.authService.userId();

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
    });
  }

  ngOnInit() {}

}
