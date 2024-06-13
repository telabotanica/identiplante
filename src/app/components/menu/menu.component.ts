import {Component, inject} from '@angular/core';
import {LoginComponent} from "../login/login.component";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  isMenuOpen = false;
  selectedOnglet = "";

  private commonService = inject(CommonService)

  ngOnInit(): void {
    let urlParams: { name: string, value: string }[] = this.commonService.readUrlParameters()
    const masqueTypeParam = urlParams.find((param: { name: string, value: string }) => param.name === 'masque.type');
    if (masqueTypeParam) {
      this.selectedOnglet = masqueTypeParam.value;
    }
  }

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }
}
