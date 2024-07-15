import {Component, inject, Input} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";
import {CommonService} from "../../services/common.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgClass
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() entetes: any;
  commonService = inject(CommonService)

  pas: string = "12";
  page: string = "1";
  tri: string = "date_transmission";
  ordre: string= "desc";
  lastPage = 1;
  private pageInputTimeout: any;

  ngOnInit(){
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.searchParams);

    const pageParam = urlParams.get('page');
    if (pageParam) {
      this.page = pageParam ?? this.page;
    }

    const pasParam = urlParams.get('pas');
    if (pasParam) {
      this.pas = pasParam ?? this.pas;
    }

    const triParam = urlParams.get('tri');
    if (triParam) {
      this.tri = triParam ?? this.tri
    }

    const ordreParam = urlParams.get('ordre');
    if (ordreParam) {
      this.ordre = ordreParam ?? this.ordre
    }

    this.getLastPageNumber();
  }

  nextPage(){
    let pageNumber = parseInt(this.page, 10);
    pageNumber++
    this.changePageNumber(pageNumber.toString())
  }

  previousPage(){
    let pageNumber = parseInt(this.page, 10);
    pageNumber--
    this.changePageNumber(pageNumber.toString())
  }

  goToFirstPage(){
    this.changePageNumber("1")
  }

  goToLastPage(){
    this.changePageNumber(this.lastPage.toString())
  }

  getLastPageNumber() {
    const totalResults = this.entetes?.total || 0;
    const itemsPerPage = parseInt(this.pas, 10);

    this.lastPage = Math.ceil(totalResults / itemsPerPage);
  }

  onPageInputKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updatePage((event.target as HTMLInputElement).value);
    } else {
      clearTimeout(this.pageInputTimeout);
      this.pageInputTimeout = setTimeout(() => {
        this.updatePage((event.target as HTMLInputElement).value);
      }, 1000);
    }
  }

  changePageNumber(page: string){
    this.page = page;
    this.commonService.setAnyParmam('page', this.page)
  }

  updatePage(value: string) {
    const pageNumber = parseInt(value, 10);

    if (!isNaN(pageNumber)){
      if (pageNumber > this.lastPage){
        this.changePageNumber(this.lastPage.toString())
      } else if (pageNumber >= 1) {
        this.changePageNumber(value)
      }
    }
  }

  onPasChange(newPas: string) {
    this.pas = newPas;
    this.commonService.setAnyParmam('pas', this.pas);
    this.getLastPageNumber();
    // Optionally, reset to the first page to avoid out-of-bounds page number
    this.page = "1";
    this.commonService.setAnyParmam('page', this.page);
  }

}
