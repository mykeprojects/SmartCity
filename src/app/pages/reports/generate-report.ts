import { Component } from '@angular/core';
import { AppChart } from 'src/app/components/charts/app-chart/app-chart.component';
import { Report } from 'src/app/models/reports/reportResponse';
import { ReportsService } from 'src/app/services/reports/report.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatButton } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, AppChart, MatButton],
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

  onEnter(event: KeyboardEvent | Event) {
    const e = event as KeyboardEvent;

    if (!e.shiftKey) {
      e.preventDefault();
      this.sendPrompt();
    }
  }

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
        const errorMessage = this.generateErrorMessage(err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al generar reporte ' + errorMessage,
          showConfirmButton: false,
          timer: 10000,
          timerProgressBar: true
        });
      }
    });
  }

  private generateErrorMessage(err: HttpErrorResponse): String{
    if (err.status === 0) return 'No hay conexión con el servidor';
    if (err.status === 400) return 'El texto que usted ha enviado estaba vacío o malformado'
    if (err.status === 422) return 'La solicitud que usted hizo no se pudo asociar a ningun tipo de gráfica';
    if (err.status === 500) return 'Error de procesamiento del backend';
    return err.error?.message || 'Error inesperado';
  }


}
