import {Component, effect, inject, Input} from '@angular/core';
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
  profilUrl = ""

  commonService = inject(CommonService)
  delService = inject(DelService)
  authService = inject(AuthService);
  cookieService = inject(CookieService);
  route = inject(ActivatedRoute)
  router = inject(Router)

  extendedObs = this.commonService.extendedObs();
  userId = this.authService.userId();
  urlParamsString = this.commonService.urlParamsString();

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
    this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
    this.dateTransmission = this.obs.date_transmission ? this.commonService.formatDateString(this.obs.date_transmission) : '';
    this.nomScientifique = this.obs.determination_ns ?? 'Indéterminé'
    //TODO: gérer quand plusieurs images
    this.selectedImage = this.obs.images[0]
    this.profilUrl = this.obs.auteur_id ? environment.profilUrl + this.obs.auteur_id : "";

    this.transformCommentaireAndVotes();
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
    this.commonService.setExtendedObs(this.obs.id_observation)
    this.isCardExtended = true;
  }

  reduceObs() {
    this.commonService.reduceExtendedObs(this.obs.id_observation)
    this.isCardExtended = false;
  }

  transformCommentaireAndVotes(){
    if (this.obs.commentaires) {
      //On transforme les objets commentaires en array pour pouvoir boucler dessus
      this.commentaires.push(...Object.values(this.obs.commentaires));

      // Idem pour les votes de chaque commentaire
      this.commentaires.forEach((commentaire: any) => {
        let votesArray = <any>[];
        let score = 0;
        commentaire.score = score

        if (commentaire.votes){
          this.delService.getVoteDetail(commentaire["id_commentaire"], commentaire['observation']).subscribe((data) => {
            votesArray.push(...Object.values(data.resultats))

            commentaire.votes = this.commonService.deleteVotesDuplicate(votesArray);

            commentaire.votes.forEach((vote: any) => {
              score = this.commonService.calculerScoreVotes(vote,  score)
            })

            commentaire.score = score
            this.commentaires.sort((a: any, b: any) => b.score - a.score);
          })
        }
        commentaire.score = score
      })
    }

    // Pour affichage du vote existant pour users connectés
    this.commentaires.forEach((proposition: any) => {
      if (this.userId && proposition.votes != undefined) {
        let votesArray = [];
        votesArray.push(...Object.values(proposition.votes))
        const userVote: any = votesArray.find((vote: any) => vote['auteur.id'] === this.userId);
        proposition.userVote = userVote ? userVote.vote : null;
        proposition.hasUserVoted = !!userVote;
      }
    });
  }

  voter(value: string, comId: string){
    let voteInfos = {
      obsId: this.obs.id_observation,
      voteId: comId,
      user: "",
      value: value
    }
    this.voteErrorMessage = "";

    if (this.userId){
        this.authService.identite().subscribe({
          next: (data) => {
            const token = data.token ?? "";
            this.authService.getUser(token).subscribe({
              next: (userData) =>{
                voteInfos.user= userData.id_utilisateur
                this.delService.saveVote(voteInfos, token).subscribe({
                  next: (data) => {
                    console.log(data)
                    location.reload()
                  },
                  error: (err) => {
                    console.log(err.error.error)
                    this.voteErrorMessage = "Erreur, lors de l'enregistrement du vote"
                  }
                })
              },
              error: (err) => {
                console.log(err.error.error)
                this.voteErrorMessage = "Erreur, veuillez vous reconnecter"
                // this.voteAnonyme(voteInfos)
              }
            })
          },
          error: (err) => {
            console.log(err.error.error)
            this.voteErrorMessage = "Erreur, veuillez vous reconnecter"
            // this.voteAnonyme(voteInfos)
          }
        })
    } else {
      this.voteAnonyme(voteInfos)
    }
  }

  voteAnonyme(voteInfos: any){
    this.voteErrorMessage = "";

    this.authService.getUser("").subscribe((userData) => {
      voteInfos.user= userData.id_utilisateur
      this.delService.saveVote(voteInfos).subscribe({
        next: (data) => {
          location.reload()
          console.log(data)
        },
        error: (err) => {
          console.log(err.error.error)
          this.voteErrorMessage = "Erreur, lors de l'enregistrement du vote"
        }
      })
    })
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

}
