import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteCommentComponent } from './vote-comment.component';

describe('VoteCommentComponent', () => {
  let component: VoteCommentComponent;
  let fixture: ComponentFixture<VoteCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
