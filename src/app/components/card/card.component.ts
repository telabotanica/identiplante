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

  obsAdditionnalInfos = <any>[];
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
  validatedObs = false;

  commonService = inject(CommonService)
  delService = inject(DelService)
  authService = inject(AuthService);
  cookieService = inject(CookieService);
  route = inject(ActivatedRoute)
  router = inject(Router)
  voteService = inject(VoteService)
  transFormDataService = inject(TransformDataService)
  elRef = inject(ElementRef);

  extendedObs = this.commonService.extendedObs();
  userId = this.authService.userId();
  urlParamsString = this.commonService.urlParamsString();
  pays: any[] = [];

  @ViewChild('obsImage', { static: true }) obsImage!: ElementRef<HTMLImageElement>;
  isInView: boolean = false;

  constructor() {
    effect(()=>{
      this.extendedObs = this.commonService.extendedObs();
    })

    effect(() => {
      this.userId = this.authService.userId();
      this.commentaires = this.transFormDataService.transformCommentaireAndVotes(this.obs, this.commentaires, this.userId)
      this.commentaires = this.transFormDataService.removeCommentaireFromPropositions(this.commentaires)
      this.commentaires = this.transFormDataService.getUserVote(this.commentaires, this.userId)
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

    this.selectedImage = this.obs.images ? this.obs.images[0] : '';
    this.profilUrl = this.obs.auteur_id ? environment.profilUrl + this.obs.auteur_id : "";
    this.displayedName = (this.obs.auteur_nom).trim() ? this.obs.auteur_nom : this.obs.auteur_courriel

    this.commentaires = this.transFormDataService.transformCommentaireAndVotes(this.obs, this.commentaires, this.userId)
    this.commentaires = this.transFormDataService.removeCommentaireFromPropositions(this.commentaires)
    this.commentaires = this.transFormDataService.getUserVote(this.commentaires, this.userId)

    const paysList = this.commonService.paysList();
    if (paysList) {
      this.pays = paysList;
    }

    if (this.pays && this.obs.pays){
      let nomPays = this.pays.find(pays => pays.code_iso_3166_1 === this.obs.pays);
      this.displayedCountry = nomPays?.nom_fr ?? this.obs.pays;
    }

    this.validatedObs = this.commonService.findValidatedObs(this.commentaires);

    this.fixDeterminationForValidatedObs()
    // console.log(this.obs)
    // console.log(this.commentaires)
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isInView = true;
          observer.unobserve(this.elRef.nativeElement);
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.1
    });

    observer.observe(this.elRef.nativeElement);
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
        this.obsAdditionnalInfos = data;
        this.fixDeterminationForValidatedObs()
        // console.log(this.obs)
        // console.log(this.obsAdditionnalInfos)
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

  changeSelectedImage(image: any) {
    this.selectedImage = image;
  }

  scrollImages() {
    this.commonService.scrollImages(this.imageCarousel)
  }

  // Fix bancal temporaire pour règler le problème des détails d'une obs qui disparaissent lors de la validation
  //TODO: fixer le problème au niveau du web service
  fixDeterminationForValidatedObs(){
    if (!this.obs.determination_ns){
      const validatedObs = this.commonService.findValidatedObs(this.commentaires);

      if (validatedObs){
        this.obs.determination_ns = validatedObs.nom_sel;
        this.obs.determination_nn = validatedObs.nom_sel_nn;
        this.obs.determination_nt = validatedObs.nom_ret_nn;
        this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé';
      }
    }
  }

}
