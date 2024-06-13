import {Component, effect, inject, input} from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-contenu',
  standalone: true,
  imports: [],
  templateUrl: './contenu.component.html',
  styleUrl: './contenu.component.css'
})
export class ContenuComponent {
  authService = inject(AuthService);
  userId = this.authService.userId();

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
    });
  }
}
