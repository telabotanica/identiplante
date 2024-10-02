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

  voteUtilisateur(voteInfos: any): BehaviorSubject<string>{
    let voteErrorMessageSubject = new BehaviorSubject<string>("");

    this.delService.saveVote(voteInfos).subscribe({
      next: (data) => {
        console.log(data)
        location.reload()
        voteErrorMessageSubject.next("");
      },
      error: (err) => {
        console.log(err.error.error)
        location.reload()
        voteErrorMessageSubject.next("Erreur, lors de l'enregistrement du vote")
      }
    })

    return voteErrorMessageSubject;
  }
}
