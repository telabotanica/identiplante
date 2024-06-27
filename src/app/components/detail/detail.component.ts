import {Component, effect, inject} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";
import {Observation} from "../../models/observation";
import { environment } from '../../../environments/environment';
import {PopupDetailVotesComponent} from "../popup-detail-votes/popup-detail-votes.component";
import {PopupAjoutCommentaireComponent} from "../popup-ajout-commentaire/popup-ajout-commentaire.component";
import {AuthService} from "../../services/auth.service";
import {CommentaireComponent} from "../commentaire/commentaire.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    PopupAjoutCommentaireComponent,
    PopupDetailVotesComponent,
    CommentaireComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  route = inject(ActivatedRoute)
  commonService = inject(CommonService)
  delService = inject(DelService)
  authService = inject(AuthService);

  obsId: string = "";
  obs!: any;
  commentaires = <any>[];
  dateObservation = "";
  nomScientifique= '';
  selectedImage: any;
  isLoading = true;
  departement = "";
  profilUrl = ""
  voteErrorMessage = "";
  popupDetailVotes = "";
  popupAddCommentOnDetail = false;
  popupAddCommentOnDetailId: string | null = null;
  commentType= "";
  commentairesGrouped = <any>{ proposition: [], commentaire: [] };

  urlParamsString = this.commonService.urlParamsString();
  userId = this.authService.userId();

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
    });

    effect(()=> {
      this.urlParamsString = this.commonService.urlParamsString();
    })
  }

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('obs~')) {
        // On récupère l'obs à partir du fragment
        const obsPart = fragment.split('~')[1];
        this.obsId = obsPart.split(/[?&]/)[0];
        this.delService.getObservation(this.obsId).subscribe({
          next: (data: any) => {
            this.obs = data
            this.isLoading = false;
            this.transformCommentaireAndVotes();
            //TODO Afficher image principale + miniatures
            //TODO bouton accepter cette proposition
            //TODO bouton dépublier (admin 1 ou 2 ?)
            this.departement = this.obs.id_zone_geo ? this.obs.id_zone_geo.slice(0,2) : "";
            this.dateObservation = this.obs.date_observation ? this.commonService.formatDateString(this.obs.date_observation) : '';
            this.nomScientifique = this.obs["determination.ns"] ?? 'Indéterminé';
            this.profilUrl = this.obs['auteur.id'] ? environment.profilUrl + this.obs['auteur.id'] : "";

            this.grouperReponses()

            console.log(this.obs)
            console.log(this.commentaires)
            console.log(this.commentairesGrouped)
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
            //Niveau 1:
            // const index = this.commentairesGrouped.proposition.findIndex(
            //   (prop: any) => prop.id_commentaire === commentaire.proposition
            // );
            // if (index !== -1) { // Sous niveaux de manière récursive
              let parent = this.trouverParent(this.commentairesGrouped.proposition, commentaire.id_parent)
              if (!parent.reponses){
                parent.reponses = []
              }
              parent.reponses.push(commentaire)
            // }
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
            commentaire.votes = votesArray
            commentaire.votes.forEach((vote: any) => {
              let scoreValue = 3;

              if (!vote['auteur_courriel']){ // Si le vote est anonyme
                scoreValue = 1
              }

              if (parseInt(vote.vote, 10) == 1){
                score += scoreValue
              } else {
                score -= scoreValue
              }
            })
            commentaire.score = score
            this.commentaires.sort((a: any, b: any) => b.score - a.score);
          })
        }
        commentaire.score = score
      })
    }
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

}


