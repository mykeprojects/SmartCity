import { Component, SimpleChanges } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Input } from '@angular/core';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { Citizen } from 'src/app/models/territorial/citizen';
import { Vote } from 'src/app/models/territorial/vote';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-vote-comment',
  imports: [MatCard,MatCardContent,MatIcon],
  templateUrl: './vote-comment.component.html',
  styleUrl: './vote-comment.component.scss',
})
export class VoteCommentComponent {
  constructor(private citizenService: CitizenService){}
  @Input() vote: Vote;
  citizen: string;
  date: string;

  ngOnInit(){
    this.citizen = "Ciudadano no disponible";
    this.date = "Fecha no disponible"
  }

  ngOnChanges(change: SimpleChanges){
    if (change['vote']){
      this.citizenService.getById(this.vote.id_citizen).subscribe(citizen =>{
        this.citizen = citizen.name;
        this.date = new Date(this.vote.vote_date).toLocaleString('es-CO');
      })



    }
  }

  range(n: number): number[] {
    return Array(n).fill(0);
  }

}
