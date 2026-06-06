import { Component } from '@angular/core';
import { SimplePie } from 'src/app/components/charts/simple-pie/simple-pie.component';
import { Report } from 'src/app/models/reports/reportResponse';
import { ReportsService } from 'src/app/services/reports/report.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, SimplePie],
  templateUrl: './generate-report.html',
  styleUrl: './generate-report.scss',
})
export class GenerateReport {

  prompt = '';
  report?: Report;

  constructor(
    private reportService: ReportsService
  ) {}

  sendPrompt() {
    if (!this.prompt.trim()) return;

    this.reportService.getReport(this.prompt).subscribe({
      next: (report) => {
        this.report = report;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
