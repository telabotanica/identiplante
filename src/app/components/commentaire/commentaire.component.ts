import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PopupAjoutCommentaireComponent} from "../popup-ajout-commentaire/popup-ajout-commentaire.component";

@Component({
  selector: 'app-commentaire',
  standalone: true,
  imports: [
    CommonModule,
    PopupAjoutCommentaireComponent
  ],
  templateUrl: './commentaire.component.html',
  styleUrl: './commentaire.component.css'
})
export class CommentaireComponent {
  @Input() commentaires: any[] = [];
  @Input() niveau: number = 0;

  popupAddComment = false;
  popupAddCommentId: string | null = null;
  commentType= "";
  proposition = ""

  ngOnInit(){
    this.commentaires.forEach((commentaire) => {
      if (commentaire.nom_sel){
        commentaire.proposition = commentaire.id_commentaire
      }
    })
  }

  openAddComment(commentType: string, id?: string){
    this.popupAddComment = true;
    this.popupAddCommentId = id ? id : null;
    this.commentType = commentType
  }

  closeAddComment(){
    this.popupAddComment = false
    this.commentType = ""
  }
}
