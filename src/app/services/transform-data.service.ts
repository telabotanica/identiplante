import {inject, Injectable} from '@angular/core';
import {CommonService} from "./common.service";
import {DelService} from "./del.service";
import {Observation} from "../models/observation";

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
            votesArray.push(...Object.values(data))

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

    return commentaires;
  }

  // Permet de n'afficher que les propositions
  removeCommentaireFromPropositions(commentaires: Array<any>): Array<any> {
    return commentaires.filter(commentaire =>
      commentaire.nom_referentiel && commentaire.nom_sel_nn
    );
  }


  // Pour affichage du vote existant pour users connectés
  getUserVote(commentaires: any[], userId: string): Array<any>{
    commentaires.forEach((proposition: any) => {
      if (userId && proposition.votes != undefined) {
        let votesArray = [];
        votesArray.push(...Object.values(proposition.votes))
        // On recherche le dernier vote de l'utilisateur pour chaque proposition
        const userVote: any = votesArray.reverse().find((vote: any) => vote['auteur.id'] == userId);
        proposition.userVote = userVote ? userVote.vote : null;
        proposition.hasUserVoted = !!userVote;
      } else {
        proposition.userVote = null
        proposition.hasUserVoted = null
      }
    });

    return commentaires;
  }

  replacePictureFormat(observation: Observation, format: string): Observation {
    const FORMATS = ["XL", "S", "M"];
    // console.log(observation);

    // Vérifier si observation.images est un objet ou un tableau
    if (observation.images && typeof observation.images === 'object' && !Array.isArray(observation.images)) {
      // Convertir l'objet en tableau
      observation.images = Object.values(observation.images);
    }

    // Maintenant que nous sommes sûrs d'avoir un tableau, on peut utiliser forEach
    if (Array.isArray(observation.images)) {
      observation.images.forEach((image: any) => {
        if (image["binaire.href"]) {
          FORMATS.forEach(existingFormat => {
            if (image["binaire.href"].includes(existingFormat)) {
              image["binaire.href"] = image["binaire.href"].replace(existingFormat, format);
            }
          });
        }
      });
    }

    return observation;
  }

  transformImageFromObjectToArray(images: Array<any>): Array<any> {
    if (images && typeof images === 'object' && !Array.isArray(images)) {
      // Convertir l'objet en tableau
      images = Object.values(images);
    }

    return images;
  }
}
