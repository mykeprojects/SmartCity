import { Component } from '@angular/core';
import { AppChart } from 'src/app/components/charts/app-chart/app-chart.component';
import { Report } from 'src/app/models/reports/reportResponse';
import { ReportsService } from 'src/app/services/reports/report.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, AppChart],
  templateUrl: './generate-report.html',
  styleUrl: './generate-report.scss',
})
export class GenerateReport {

  loading = false;
  prompt = '';
  report?: Report;

  constructor(
    private reportService: ReportsService
  ) {}

  sendPrompt() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.reportService.getReport(this.prompt).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al generar reporte ' + err.error.message,
          showConfirmButton: false,
          timer: 10000,
          timerProgressBar: true
        });
      }
    });
  }
}
