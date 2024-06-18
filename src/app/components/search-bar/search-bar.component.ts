import {Component, inject} from '@angular/core';
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  search = "";
  private pageInputTimeout: any;

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
    this.updateSearch();
  }

  openAdvancedSearchPopUp(){
    console.log('ouvre le popup')
  }
}
