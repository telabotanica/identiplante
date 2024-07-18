import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {Observation} from "../../models/observation";
import {CommonService} from "../../services/common.service";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-popup-big-image',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './popup-big-image.component.html',
  styleUrl: './popup-big-image.component.css'
})
export class PopupBigImageComponent {
  @Output() closePopupEmitter = new EventEmitter<void>()
  @Input() obs: any;
  @Input() selectedImage: any;
  @Input() images: any;

  dateTransmission = "";
  nomScientifique= '';
  @ViewChild('bigImageCarousel') bigImageCarousel!: ElementRef;
  carouselOverflow: boolean = false;
  overflowRight: boolean = false;

  commonService = inject(CommonService)

  ngOnInit(){
    this.dateTransmission = this.obs['date.transmission'] ? this.commonService.formatDateString(this.obs.date_transmission) : '';
    this.nomScientifique = this.obs['determination.ns'] ?? 'Indéterminé';
    this.checkOverflow();
  }

  ngAfterViewInit() {
    this.checkOverflow();
  }

  close() {
    this.closePopupEmitter.emit();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/pasdephoto.jpg';
  }

  changeSelectedImage(image: any) {
    this.selectedImage = image;
  }

  scrollImages(direction: 'left' | 'right') {
    if (this.bigImageCarousel) {
      const carousel = this.bigImageCarousel.nativeElement;
      const scrollAmount = 145;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

      if (direction === 'right') {
        carousel.scrollTo({
          left: carousel.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
        if (carousel.scrollLeft >= maxScrollLeft) {
          carousel.scrollTo({
            left: 0,
            behavior: 'auto'
          });
        }
      } else {
        carousel.scrollTo({
          left: carousel.scrollLeft - scrollAmount,
          behavior: 'smooth'
        });
        if (carousel.scrollLeft <= 0) {
          carousel.scrollTo({
            left: maxScrollLeft,
            behavior: 'auto'
          });
        }
      }
      this.checkOverflow();
    }
  }

  scrollSelectedImage(direction: 'left' | 'right') {
    const currentIndex = this.images.findIndex((image: any) => image === this.selectedImage);
    let newIndex: number;

    if (direction === 'left') {
      newIndex = currentIndex === 0 ? this.images.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === this.images.length - 1 ? 0 : currentIndex + 1;
    }

    this.selectedImage = this.images[newIndex];
  }

  checkOverflow() {
    if (this.bigImageCarousel) {
      const carousel = this.bigImageCarousel.nativeElement;
      if (carousel.scrollWidth > carousel.clientWidth){
        this.carouselOverflow = true
      }
    }
  }

}
