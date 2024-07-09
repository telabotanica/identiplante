import {inject, Injectable} from '@angular/core';
import {DelService} from "./del.service";
import {AuthService} from "./auth.service";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  delService = inject(DelService)
  authService = inject(AuthService);

  constructor() { }

  voteAnonyme(voteInfos: any): BehaviorSubject<string> {
    let voteErrorMessageSubject = new BehaviorSubject<string>("");

    this.authService.getUser("").subscribe((userData) => {
      voteInfos.user= userData.id_utilisateur
      this.delService.saveVote(voteInfos).subscribe({
        next: (data) => {
          location.reload()
          console.log(data)
          voteErrorMessageSubject.next("");
        },
        error: (err) => {
          console.log(err.error.error)
          voteErrorMessageSubject.next("Erreur, lors de l'enregistrement du vote");
        }
      })
    })

    return voteErrorMessageSubject;
  }

  voteUtilisateur(voteInfos: any): BehaviorSubject<string>{
    let voteErrorMessageSubject = new BehaviorSubject<string>("");

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
                voteErrorMessageSubject.next("");
              },
              error: (err) => {
                console.log(err.error.error)
                voteErrorMessageSubject.next("Erreur, lors de l'enregistrement du vote")
              }
            })
          },
          error: (err) => {
            console.log(err.error.error)
            voteErrorMessageSubject.next("Erreur, veuillez vous reconnecter")
          }
        })
      },
      error: (err) => {
        console.log(err.error.error)
        voteErrorMessageSubject.next("Erreur, veuillez vous reconnecter")
      }
    })

    return voteErrorMessageSubject;
  }
}
