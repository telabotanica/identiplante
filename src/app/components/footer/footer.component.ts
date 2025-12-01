import {Component, inject} from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentUrl =  encodeURIComponent(window.location.href);
  urlWidgetRemarque = environment.urlWidgetRemarques + '?service=identiplante&pageSource=' + this.currentUrl;
  showMessageUrlCopied = false;
  logoSrc = 'assets/img/logos/logo_ministere.webp';

  openWindow(url: string) {
    const email = 'identiplante_remarques@tela-botanica.org';
    const pageSource = this.currentUrl;
    const fullUrl = `${url}?email=${email}&pageSource=${pageSource}`;
    window.open(fullUrl, 'Tela Botanica - Remarques', 'height=700,width=640,scrollbars=yes,resizable=yes');
    return false;
  }

  copyUrl(){
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showMessageUrlCopied = true;
      setTimeout(() => {
        this.showMessageUrlCopied = false;
      }, 1000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  changeLogo(isHover: boolean) {
    this.logoSrc = isHover ? 'assets/img/logos/logo_ministere_hover.webp' : 'assets/img/logos/logo_ministere.webp';
  }
}
