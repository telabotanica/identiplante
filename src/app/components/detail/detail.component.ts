import {Component, effect, ElementRef, inject, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {Observation} from "../../models/observation";
import { environment } from '../../../environments/environment';
import {PopupDetailVotesComponent} from "../popup-detail-votes/popup-detail-votes.component";
import {PopupAjoutCommentaireComponent} from "../popup-ajout-commentaire/popup-ajout-commentaire.component";
import {AuthService} from "../../services/auth.service";
import {CommentaireComponent} from "../commentaire/commentaire.component";
import {CommonModule} from "@angular/common";
import {VoteService} from "../../services/vote.service";
import {TransformDataService} from "../../services/transform-data.service";
import {PopupBigImageComponent} from "../popup-big-image/popup-big-image.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    PopupAjoutCommentaireComponent,
    PopupDetailVotesComponent,
    CommentaireComponent,
    CommonModule,
    PopupBigImageComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  route = inject(ActivatedRoute)
  commonService = inject(CommonService)
  delService = inject(DelService)
  authService = inject(AuthService);
  router = inject(Router)
  voteService = inject(VoteService)
  transFormDataService = inject(TransformDataService)

  obsId: string = "";
  obs!: any;
  obsToCompare!: any;
  commentaires = <any>[];
  dateObservation = "";
  dateTransmission = "";
  nomScientifique= '';
  selectedImage: any;
  isLoading = true;
  departement = "";
  profilUrl = ""
  voteErrorMessage = "";
  validationErrorMessage = "";
  depublierErrorMessage = "";
  deletePropositionErrorMessage = "";
  popupAddComment = false;
  popupDetailVotes = "";
  popupAddCommentOnDetail = false;
  popupAddCommentOnDetailId: string | null = null;
  commentType= "";
  commentairesGrouped = <any>{ proposition: [], commentaire: [] };
  showWarningPopup = false;
  warningDeleteProposition = false;
  deletePropositionId: string | null = null;
  fluxRssUrl = environment.rssUrl + '&masque.observation=';
  popupBigImage = false;
  displayedName = "";
  displayedCountry: any;
  isHovered = { like: false, dislike: false };
  @ViewChild('imageCarousel') imageCarousel!: ElementRef;
  telaUrl = environment.telaUrl

  urlParamsString = this.commonService.urlParamsString();
  userId = this.authService.userId();
  isVerificateur = this.authService.isVerificateur()
  isAdmin = this.authService.isAdmin()

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
      this.isVerificateur = this.authService.isVerificateur()
      this.isAdmin = this.authService.isAdmin()

      // Pour affichage du vote existant pour users connectés
      this.commentairesGrouped.proposition.forEach((proposition: any) => {
        const userVote = proposition.votes.find((vote: any) => vote['auteur.id'] === this.userId);
        proposition.userVote = userVote ? userVote['vote'] : null;
        proposition.hasUserVoted = userVote ? true : false;
      });

    });

    effect(()=> {
      this.urlParamsString = this.commonService.urlParamsString();
    })
  }

  ngOnInit(): void {
    //TODO si une proposition est déjà validée, ne plus montrer le bouton de validation
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('obs~')) {
        // On récupère l'obs à partir du fragment
        const obsPart = fragment.split('~')[1];
        this.obsId = obsPart.split(/[?&]/)[0];
        this.delService.getObservation(this.obsId).subscribe({
          next: (data: any) => {
            this.obs = data;
            this.isLoading = false;
            // console.log(this.obs)
            this.commentaires = this.transFormDataService.transformCommentaireAndVotes(this.obs, this.commentaires, this.userId)

            this.departement = this.obs.id_zone_geo ? this.obs.id_zone_geo.slice(0,2) : "";
            this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
            this.dateTransmission = this.obs.date_transmission ? this.commonService.formatDateString(this.obs.date_transmission) : '';
            this.nomScientifique = this.obs["determination.ns"] ?? 'Indéterminé';
            this.profilUrl = this.obs['auteur.id'] ? environment.profilUrl + this.obs['auteur.id'] : "";
            this.selectedImage = this.obs.images[0];
            this.fluxRssUrl += this.obs.id_observation;
            // this.displayedName = (this.obs.auteur_nom).trim() ? this.obs.auteur_nom : this.obs.auteur_courriel

            this.grouperReponses()
            this.obsToCompare = this.commonService.mapObservation(this.obs)

            this.fixDeterminationForValidatedObs()

            // console.log(this.commentaires)
            // console.log(this.commentairesGrouped)
          },
          error: (err) => {
            console.log(err)
          }
        })
      }
    });
  }

  grouperReponses(){
    this.commentaires.forEach((commentaire: any) => {
      this.commentairesGrouped.proposition.forEach((proposition: any) => {
        if (!proposition.reponses) {
          proposition.reponses = [];
        }
      });

      this.commentairesGrouped.commentaire.forEach((commentaire: any) => {
        if (!commentaire.reponses) {
          commentaire.reponses = [];
        }
      });

      if (commentaire.nom_sel){
        // C'est une nouvelle proposition de détermination
        commentaire.proposition = commentaire.id_commentaire
        this.commentairesGrouped.proposition.push(commentaire)
      } else { //C'est un commentaire
        if (commentaire.id_parent == '0') {// C'est un nouveau commentaire
          this.commentairesGrouped.commentaire.push(commentaire)
        } else {
          if (commentaire.proposition != '0'){ // C'est lié à une détermination
            /*
            ** On va chercher dans le tableau proposition à l'index correspondant à commentaire.proposition
            ** Si id_parent == proposition -> on met direct dans réponses
            ** Sinon on va chercher un niveau au dessous et ainsi de suite
             */
            let parent = this.trouverParent(this.commentairesGrouped.proposition, commentaire.id_parent)
            if (!parent.reponses){
              parent.reponses = []
            }
            parent.reponses.push(commentaire)

          } else { //C'est un commentaire non lié à une détermination
            // On recherche niveau par niveau si id_parent == id_commentaire
            let parent = this.trouverParent(this.commentairesGrouped.commentaire, commentaire.id_parent)
            if (!parent.reponses){
              parent.reponses = []
            }
            parent.reponses.push(commentaire)
          }
        }
      }
    })
  }

  trouverParent(commentaires: any, idParent: any): any{
    for (const node of commentaires){
      if (node.id_commentaire == idParent) return node
      if (node.reponses){
        const parent = this.trouverParent(node.reponses, idParent);
        if (parent) return parent;
      }
    }
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

  openDetailVotes(id: string){
    this.popupDetailVotes = id;
  }

  closeDetailVotes(){
    this.popupDetailVotes = "";
  }

  openAddComment(commentType: string, id?: string){
    this.popupAddCommentOnDetail = true;
    this.popupAddCommentOnDetailId = id ? id : null;
    this.commentType = commentType
  }

  closeAddComment(){
    this.popupAddCommentOnDetail = false
    this.popupAddCommentOnDetailId = null;
    this.commentType = ""
  }

  openAddCommentOnObs(commentType: string){
    this.popupAddComment = true;
    this.commentType = commentType
  }

  closeAddCommentOnObs(){
    this.popupAddComment = false
    this.commentType = ""
  }

  changeSelectedImage(image: any){
    this.selectedImage = image
  }

  validerProposition(propositionId: string, auteurId: string){
    let validationInfos = {
      ['auteur.id']: auteurId,
      ['validateur.id']: this.userId
    }

    this.delService.validerProposition(propositionId, validationInfos).subscribe({
      next: (data) => {
        console.log(data)
        location.reload()
      },
      error: (err) => {
        console.log(err)
        this.validationErrorMessage = "Une erreur s'est produite durant la validation, veuillez réessayer ultérieurement ou essayer de vous reconnecter."
      }
    })
    console.log(propositionId)
  }

  depublier(obsId: string){
    this.delService.depublier(obsId).subscribe({
      next: (data) => {
        const urlParams = new URLSearchParams(this.urlParamsString);
        const queryParams: any = {};

        urlParams.forEach((value, key) => {
          queryParams[key] = value;
        });
        // Rediriger vers la page d'accueil avec les paramètres d'URL et supprimer le fragment
        this.router.navigate(['/'], { queryParams, fragment: undefined });
      },
      error: (err) => {
        console.log(err)
        this.depublierErrorMessage = "Une erreur s'est produite durant la dépublication de l'obs."
      }
    })
  }

  confirmerDepublier(obsId: string) {
    this.showWarningPopup = false;
    this.depublier(obsId);
  }

  cancelDepublier() {
    this.showWarningPopup = false;
  }

  affichagePopupConfirmation(obsId: string){
    this.showWarningPopup = true;
  }

  affichageConfirmationDeleteProposition(propositionId: string){
    this.warningDeleteProposition = true;
    this.deletePropositionId = propositionId ? propositionId : null;
  }

  confirmerDeleteProposition(propositionId: string){
    this.warningDeleteProposition = false;
    this.deleteProposition(propositionId)
  }

  cancelDeleteProposition(){
    this.warningDeleteProposition = false;
  }

  deleteProposition(propositionId: string){
    this.delService.deleteComment(propositionId).subscribe({
      next: (data) => {
        console.log(data)
        location.reload()
      },
      error: (err) => {
        console.log(err)
        this.deletePropositionErrorMessage = "Une erreur s'est produite durant la suppression de votre proposition de détermination, veuillez réessayer ultérieurement ou essayer de vous reconnecter."
      }
    })
  }

  comparer(inputValue: string): void {
    this.commonService.setObsAComparer(this.obsToCompare);
    this.commonService.setComparerImage(inputValue)

    const redirectUrl = `${this.urlParamsString}#comparateur`;
    this.router.navigateByUrl(redirectUrl);
  }

  openBigImage(){
    this.popupBigImage = true;
  }

  closeBigImagePopup(){
    this.popupBigImage = false;
  }

  scrollImages() {
    this.commonService.scrollImages(this.imageCarousel)
  }

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


