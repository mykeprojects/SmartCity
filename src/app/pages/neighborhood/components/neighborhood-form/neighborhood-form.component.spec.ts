import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeighborhoodFormComponent } from './neighborhood-form.component';

describe('NeighborhoodFormComponent', () => {
  let component: NeighborhoodFormComponent;
  let fixture: ComponentFixture<NeighborhoodFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeighborhoodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
