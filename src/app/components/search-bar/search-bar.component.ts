import {Component, inject} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {PopupAdvancedSearchComponent} from "../popup-advanced-search/popup-advanced-search.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    PopupAdvancedSearchComponent,
    NgIf
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  search = "";
  private pageInputTimeout: any;
  displayAdvancedPopup = false;

  commonService = inject(CommonService)

  ngOnInit(){
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.searchParams);

    const pageParam = urlParams.get('masque');
    if (pageParam) {
      this.search = pageParam ?? this.search;
    }
  }

  updateSearch(){
    this.commonService.setAnyParmam('masque', this.search)
  }

  onPageInputKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search = (event.target as HTMLInputElement).value
      this.updateSearch();
    } else {
      clearTimeout(this.pageInputTimeout);
      this.pageInputTimeout = setTimeout(() => {
        this.search = (event.target as HTMLInputElement).value
        this.updateSearch();
      }, 1000);
    }
  }

  resetSearch(){
    this.search = "";
    this.commonService.deleteParam('masque')
  }

  openAdvancedSearchPopUp(){
    this.displayAdvancedPopup = !this.displayAdvancedPopup
  }

  closeAdvancedSearchPopUp() {
    this.displayAdvancedPopup = false
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.searchParams);

    // On récupère la recherche libre car peut avoir changer dans le popup
    const pageParam = urlParams.get('masque');
    this.search = pageParam ?? "";
  }
}
