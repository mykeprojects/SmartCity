import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Vote } from 'src/app/models/territorial/vote';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly apiUrl = `${environment.apiUrl}/api/votes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vote[]>{
    return this.http.get<Vote[]>(this.apiUrl);
  }

  getById(id: number): Observable<Vote>{
    return this.http.get<Vote>(`${this.apiUrl}/${id}`);
  }

  create(vote: Partial<Vote>): Observable<Vote>{
    return this.http.post<Vote>(this.apiUrl, vote)
  }

  update(vote: Vote): Observable<Vote>{
    const updatedVote = {
        id_vote: vote.id_vote,
        id_citizen: vote.id_citizen,
        stars: vote.stars,
        comment: vote.comment
    };
    return this.http.put<Vote>(`${this.apiUrl}/${vote.id_vote}`, updatedVote);
  }

  delete(id: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    getAnnotationVotes(idAnnotation: number): Observable<Vote[]> {
        return this.getAll().pipe(
            map(votes =>
            votes.filter(vote => vote.id_annotation === idAnnotation)
            )
        );
    }
}