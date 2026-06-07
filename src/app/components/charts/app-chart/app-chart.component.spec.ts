import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppChart } from './app-chart.component';

describe('AppChartComponent', () => {
  let component: AppChart;
  let fixture: ComponentFixture<AppChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
