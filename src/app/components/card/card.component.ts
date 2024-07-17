import {Component, effect, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {PopupBigImageComponent} from "../popup-big-image/popup-big-image.component";
import {CommonModule} from "@angular/common";
import {DelService} from "../../services/del.service";
import {AuthService} from "../../services/auth.service";
import {CookieService} from "ngx-cookie-service";
import { environment } from '../../../environments/environment';
import {PopupAjoutCommentaireComponent} from "../popup-ajout-commentaire/popup-ajout-commentaire.component";
import {PopupDetailVotesComponent} from "../popup-detail-votes/popup-detail-votes.component";
import {ActivatedRoute, Router} from "@angular/router";
import {VoteService} from "../../services/vote.service";
import {TransformDataService} from "../../services/transform-data.service";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    PopupBigImageComponent,
    CommonModule,
    PopupAjoutCommentaireComponent,
    PopupDetailVotesComponent
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() obs: any;

  dateObservation = "";
  dateTransmission = "";
  popupBigImage = false;
  popupAddComment = false;
  popupDetailVotes = "";
  commentType="";
  selectedImage: any;
  nomScientifique= '';
  isCardExtended = false;
  commentaires = <any>[];
  cookieName = environment.cookieName;
  voteErrorMessage = "";
  profilUrl = "";
  @ViewChild('imageCarousel') imageCarousel!: ElementRef;
  displayedName = "";
  displayedCountry: any;
  departement = "";
  isHovered = { like: false, dislike: false };

  commonService = inject(CommonService)
  delService = inject(DelService)
  authService = inject(AuthService);
  cookieService = inject(CookieService);
  route = inject(ActivatedRoute)
  router = inject(Router)
  voteService = inject(VoteService)
  transFormDataService = inject(TransformDataService)

  extendedObs = this.commonService.extendedObs();
  userId = this.authService.userId();
  urlParamsString = this.commonService.urlParamsString();
  pays: any[] = [];

  constructor() {
    effect(()=>{
      this.extendedObs = this.commonService.extendedObs();
    })

    effect(() => {
      this.userId = this.authService.userId();
    });

    effect(()=> {
      this.urlParamsString = this.commonService.urlParamsString();
    })
  }

  ngOnInit(){
    this.commonService.resetExtendedObs()
    this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
    this.dateTransmission = this.obs.date_transmission ? this.commonService.formatDateString(this.obs.date_transmission) : '';
    this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé';
    this.departement = this.obs.id_zone_geo ? this.obs.id_zone_geo.slice(0,2) : "";

    this.selectedImage = this.obs.images[0]
    this.profilUrl = this.obs.auteur_id ? environment.profilUrl + this.obs.auteur_id : "";
    this.displayedName = (this.obs.auteur_nom).trim() ? this.obs.auteur_nom : this.obs.auteur_courriel

    this.commentaires = this.transFormDataService.transformCommentaireAndVotes(this.obs, this.commentaires, this.userId)

    const paysList = this.commonService.paysList();
    if (paysList) {
      this.pays = paysList;
    }

    if (this.pays && this.obs.pays){
      this.displayedCountry = this.pays.find(pays => pays.code_iso_3166_1 === this.obs.pays);
    }

    this.fixDeterminationForValidatedObs()

    // console.log(this.obs)
    // console.log(this.commentaires)
  }

  changeMainPicture(imageHref: string){
    this.selectedImage = imageHref;
  }

  openBigImage(){
    this.popupBigImage = true;
  }

  closeBigImagePopup(){
    this.popupBigImage = false;
  }

  extendObs(){
    this.delService.getObservation(this.obs.id_observation).subscribe({
      next: (data: any) => {
        this.obs = data;
        this.fixDeterminationForValidatedObs()
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.commonService.setExtendedObs(this.obs.id_observation)
    this.isCardExtended = true;
  }

  reduceObs() {
    this.commonService.reduceExtendedObs(this.obs.id_observation)
    this.isCardExtended = false;
  }

  voter(value: string, comId: string, obsId: string) {
    let voteInfos = {
      obsId: obsId,
      voteId: comId,
      user: this.userId,
      value: value
    }

    const voteErrorMessageSubject = this.voteService.voteUtilisateur(voteInfos);
    voteErrorMessageSubject.subscribe((message: string) => {
      this.voteErrorMessage = message;
    });
  }

  openAddComment(commentType: string){
    this.popupAddComment = true;
    this.commentType = commentType
  }

  closeAddComment(){
    this.popupAddComment = false
    this.commentType = ""
  }

  openDetailVotes(id: string){
    this.popupDetailVotes = id;
  }

  closeDetailVotes(){
    this.popupDetailVotes = "";
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/pasdephoto.jpg';
  }

  changeSelectedImage(image: any) {
    this.selectedImage = image;
  }

  scrollImages() {
    if (this.imageCarousel) {
      const carousel = this.imageCarousel.nativeElement;
      const scrollWidth = carousel.scrollWidth - ((115+20)*3); // Total width including cloned images
      carousel.scrollTo({
        left: carousel.scrollLeft + 145,
        behavior: 'smooth'
      });
      // Reset to the beginning if scrolled past the total width
      if (carousel.scrollLeft >= scrollWidth) {
        carousel.scrollTo({
          left: 0,
          behavior: 'auto'
        });
      }
    }
  }

  getVoteIconSrc(type: 'like' | 'dislike', commentaire: any): string {
    if (type === 'like') {
      if (commentaire.length == 0){
        if (this.isHovered.like) {
          return 'assets/icons/like_inactif_hover.png'
        } else {
          return 'assets/icons/like_inactif.png'
        }
      }

      if (commentaire.isHoveredLike) {
        return commentaire.userVote === '1' ? 'assets/icons/like_actif_hover.png' : 'assets/icons/like_inactif_hover.png';
      } else {
        return commentaire.userVote === '1' ? 'assets/icons/like_actif.png' : 'assets/icons/like_inactif.png';
      }
    } else if (type === 'dislike') {
      if (commentaire.length == 0){
        if (this.isHovered.dislike) {
          return 'assets/icons/dislike_inactif_hover.png'
        } else {
          return 'assets/icons/dislike_inactif.png'
        }
      }

      if (commentaire.isHoveredDislike) {
        return commentaire.userVote === '0' ? 'assets/icons/dislike_actif_hover.png' : 'assets/icons/dislike_inactif_hover.png';
      } else {
        return commentaire.userVote === '0' ? 'assets/icons/dislike_actif.png' : 'assets/icons/dislike_inactif.png';
      }
    }
    return '';
  }

  onHover(type: 'like' | 'dislike', commentaire: any, isHovering: boolean): void {
    if (type === 'like') {
      commentaire.isHoveredLike = isHovering;
    } else if (type === 'dislike') {
      commentaire.isHoveredDislike = isHovering;
    }
  }

  onHoverSimple(type: 'like' | 'dislike', isHovering: boolean): void {
    if (type === 'like') {
      this.isHovered.like = isHovering;
    } else if (type === 'dislike') {
      this.isHovered.dislike = isHovering;
    }
  }

  // Fix bancal temporaire pour règler le problème des détails d'une obs qui disparaissent lors de la validation
  //TODO: fixer le problème au niveau du web service
  fixDeterminationForValidatedObs(){
    if (!this.obs.determination_ns){
      const validatedObs = this.commentaires.find((commentaire: any) => commentaire.proposition_retenue === '1');

      if (validatedObs){
        this.obs.determination_ns = validatedObs.nom_sel;
        this.obs.determination_nn = validatedObs.nom_sel_nn;
        this.obs.determination_nt = validatedObs.nom_ret_nn;
        this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé';
      }
    }
  }

}
