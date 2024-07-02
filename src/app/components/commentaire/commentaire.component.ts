import {Component, effect, inject, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PopupAjoutCommentaireComponent} from "../popup-ajout-commentaire/popup-ajout-commentaire.component";
import {AuthService} from "../../services/auth.service";
import {DelService} from "../../services/del.service";

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

  authService = inject(AuthService);
  delService = inject(DelService)

  popupAddComment = false;
  popupAddCommentId: string | null = null;
  commentType= "";
  proposition = "";
  showWarningPopup = false;
  warningPopUpId: string | null = null;
  userId = this.authService.userId();
  deleteCommentErrorMessage = "";

  constructor() {
    effect(() => {
      this.userId = this.authService.userId();
    });
  }

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

  deleteComment(commentId: string){
    this.delService.deleteComment(commentId).subscribe({
      next: (data) => {
        console.log(data)
        location.reload()
      },
      error: (err) => {
        console.log(err)
        this.deleteCommentErrorMessage = "Une erreur s'est produite durant la suppression de votre commentaire, veuillez réessayer ultérieurement ou essayer de vous reconnecter."
      }
    })
  }

  confirmerDeleteComment(commentId: string) {
    this.showWarningPopup = false;
    this.deleteComment(commentId);
  }

  cancelDeleteComment() {
    this.showWarningPopup = false;
  }

  affichagePopupConfirmation(commentId: string){
    this.showWarningPopup = true;
    this.warningPopUpId = commentId ? commentId : null;
  }
}
