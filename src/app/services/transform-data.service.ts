import {inject, Injectable} from '@angular/core';
import {CommonService} from "./common.service";
import {DelService} from "./del.service";

@Injectable({
  providedIn: 'root'
})
export class TransformDataService {
  commonService = inject(CommonService)
  delService = inject(DelService)

  constructor() { }

  // Calcul le score des votes puis réorganise les votes du + haut score au + petit
  transformCommentaireAndVotes(obs: any, commentaires: any[], userId: string): Array<any>{
    if (obs.commentaires) {
      commentaires = [];
      //On transforme les objets commentaires en array pour pouvoir boucler dessus
      commentaires.push(...Object.values(obs.commentaires));

      // Idem pour les votes de chaque commentaire
      commentaires.forEach((commentaire: any) => {
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
            commentaires.sort((a: any, b: any) => b.score - a.score);
          })
        }
        commentaire.score = score
        commentaire.isHoveredLike = false
        commentaire.isHoveredDislike = false
      })
    }

    // Pour affichage du vote existant pour users connectés
    commentaires.forEach((proposition: any) => {
      if (userId && proposition.votes != undefined) {
        let votesArray = [];
        votesArray.push(...Object.values(proposition.votes))
        // On recherche le dernier vote de l'utilisateur pour chaque proposition
        const userVote: any = votesArray.reverse().find((vote: any) => vote['auteur.id'] == userId);
        proposition.userVote = userVote ? userVote.vote : null;
        proposition.hasUserVoted = !!userVote;
      }
    });

    return commentaires;
  }
}
