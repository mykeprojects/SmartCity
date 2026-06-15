import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Report } from 'src/app/models/reports/reportResponse';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './app-chart.component.html',
})
export class AppChart implements OnChanges {
  @Input() report!: Report;

  public chartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report'] && this.report) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.chartOptions = {
      series: this.report.series,
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
      chart: {
        width: '60%',
        type: this.report.type,
      },
      labels: this.report.labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%',
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
}