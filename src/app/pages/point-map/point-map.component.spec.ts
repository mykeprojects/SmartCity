import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointMapComponent } from './point-map.component';

describe('PointMapComponent', () => {
  let component: PointMapComponent;
  let fixture: ComponentFixture<PointMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
