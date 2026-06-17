import { Component, SimpleChanges } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { FormGroup, FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Input } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import Swal from 'sweetalert2';
import { Vote } from 'src/app/models/territorial/vote';
import { VoteService } from 'src/app/services/territorial/vote.service';
import { SecurityService } from 'src/app/services/security.service';
import { MatIcon } from '@angular/material/icon';
import { VoteCommentComponent } from '../vote-comment/vote-comment.component';
@Component({
  selector: 'app-vote-form',
  imports: [NgxStarRatingModule,ReactiveFormsModule,MatCard,MatLabel,MatFormField,MatCardContent, MatInput, MatButton,MatIcon, VoteCommentComponent],
  templateUrl: './vote-form.component.html',
  styleUrl: './vote-form.component.scss',
})
export class VoteFormComponent {
  @Input() currentAnnotation?: AnnotationForDisplay | null;
  ratingForm: FormGroup;
  ratingControl = new FormControl(0);
  hasCommented = false;
  currentUserVote: Vote | undefined;
  votes: Vote[] = [];
  constructor(private fb: FormBuilder, private voteService: VoteService,private securityService: SecurityService){
    this.ratingForm = this.fb.group({
      rating: [0],
      comment: [''],
      averageRating: [{value: 0,disabled: true}],
    });
  }

  getAverageStars(): number[] {
    const average = Number(this.ratingForm.get('averageRating')?.value) || 0;
    const rounded = Math.floor(average);
    return Array(rounded).fill(0);
  }

  ngOnInit(){
  }
  ngOnChanges(changes: SimpleChanges){
    if (changes['currentAnnotation']){
      this.currentAnnotationUpdate();
    }
  }

  currentAnnotationUpdate(){
    if (this.currentAnnotation){
      this.voteService.getAnnotationVotes(this.currentAnnotation.id_annotation).subscribe(votes =>{
        this.votes = votes;

        const totalStars = votes.reduce((sum, vote) => sum + vote.stars,0);    
        this.ratingForm.get('averageRating')?.enable();
        if (votes.length>0){
          this.ratingForm.get('averageRating')?.setValue((totalStars/votes.length));
        }
        else{
          this.ratingForm.get('averageRating')?.setValue(0);
        }
        this.ratingForm.get('averageRating')?.disable();

        this.securityService.getUserIdInBackend().subscribe(id => {
          this.currentUserVote = votes.find(vote => vote.id_citizen == id);
          if (this.currentUserVote){
            this.hasCommented = true;
            this.ratingForm.patchValue({
              rating: this.currentUserVote.stars,
              comment: this.currentUserVote.comment
            });

          }
          else{
            this.hasCommented = false;
            this.ratingForm.patchValue({
              rating: 0,
              comment: '',
            });
          }
        })

      })
    }
  }

  onSubmitRating(){
    if (this.ratingForm.value.rating < 1){
      Swal.fire({
        title: 'Error',
        text: 'Primero asígnele una calificación a la anotación',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    if (!this.hasCommented){
      this.securityService.getUserIdInBackend().subscribe(id => {
        if(id){
          const newVote: Partial<Vote>={
            id_citizen: id,
            id_annotation: this.currentAnnotation?.id_annotation,
            stars: this.ratingForm.value.rating,
            comment: this.ratingForm.value.comment
          }
          this.voteService.create(newVote).subscribe(vote =>{
            this.hasCommented = true;
            this.currentUserVote = vote;
            this.currentAnnotationUpdate();
          });

        }
        else{
          Swal.fire({
            title: 'Error',
            text: 'El usuario actual no se encuentra en el backend',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ef4444'
          });
        }

      })
    }
    else{
      if (this.currentUserVote){ 
        this.currentUserVote.stars = this.ratingForm.value.rating;
        this.currentUserVote.comment = this.ratingForm.value.comment;
        this.voteService.update(this.currentUserVote).subscribe(newVote =>{
          if (newVote){
            this.currentAnnotationUpdate();
          }
          else{
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar su voto actual',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ef4444'
            });
          }
        })
      }
    }
  }

  onDelete(){
    if(this.currentUserVote){
      this.voteService.delete(this.currentUserVote?.id_vote).subscribe(vote=>{
        this.currentAnnotationUpdate();
      })
    }
  }
}
