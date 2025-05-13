import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {DelService} from "../../services/del.service";

@Component({
  selector: 'app-popup-detail-votes',
  standalone: true,
  imports: [],
  templateUrl: './popup-detail-votes.component.html',
  styleUrl: './popup-detail-votes.component.css'
})
export class PopupDetailVotesComponent {
  @Output() closePopupEmitter = new EventEmitter<void>()
  @Input() commentaire: any;
  @Input() obs: any;

  obsId = "";
  commentaireId = "";
  votes = <any>[];
  dateTransmission = "";
  nomScientifique= '';
  pourCount = 0;
  pourStat = "";
  contreCount = 0;
  contreStat = "";
  nbVotes = 0;
  votesGrouped = <any>{ pour: [], contre: [] };

  commonService = inject(CommonService)

  ngOnInit(){
    this.obsId = this.obs.id_observation
    this.commentaireId = this.commentaire.id_commentaire
    this.dateTransmission = this.commentaire.date ? this.commonService.formatDateStringWithoutT(this.commentaire.date) : '';
    this.nomScientifique = this.commentaire.nom_sel ?? 'Indéterminé'

    this.votes = this.commentaire.votes
    this.nbVotes = this.votes.length

    //TODO Regrouper les votes anonymes ?
    this.votes.forEach((vote: any) => {
      if (vote.vote === '1') {
        this.votesGrouped.pour.push(vote);
        this.pourCount++
      } else {
        this.votesGrouped.contre.push(vote);
        this.contreCount++
      }
      vote.date = vote.date ? this.commonService.formatDateStringWithoutT(vote.date) : '';
    });

    this.pourStat = ((this.pourCount / this.nbVotes)*100).toFixed(2).replace('.', ',');
    this.contreStat = ((this.contreCount / this.nbVotes)*100).toFixed(2).replace('.', ',');
  }

  close() {
    this.closePopupEmitter.emit();
  }

}
