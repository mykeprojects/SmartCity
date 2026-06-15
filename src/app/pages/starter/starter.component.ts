import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AppMathewAndersonComponent } from 'src/app/components/mathew-anderson/mathew-anderson.component';
import { AppTopCardsComponent } from 'src/app/components/top-cards/top-cards.component';
import { AppRevenueUpdatesComponent } from 'src/app/components/revenue-updates/revenue-updates.component';
import { AppYearlyBreakupComponent } from 'src/app/components/yearly-breakup/yearly-breakup.component';
import { AppMonthlyEarningsComponent } from 'src/app/components/monthly-earnings/monthly-earnings.component';
import { AppRecentTransactionsComponent } from 'src/app/components/recent-transactions/recent-transactions.component';
import { AppTopProjectsComponent } from 'src/app/components/top-projects/top-projects.component';
import Swal from 'sweetalert2';
import { SecurityService } from 'src/app/services/security.service';
@Component({
  selector: 'app-starter',
  imports: [
    MaterialModule,
    AppMathewAndersonComponent,
    AppTopCardsComponent,
    AppRevenueUpdatesComponent,
    AppYearlyBreakupComponent,
    AppMonthlyEarningsComponent,
    AppRecentTransactionsComponent,
    AppTopProjectsComponent
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  constructor(private securityService: SecurityService){}

  ngOnInit(){
    this.securityService.getUserIdInBackend().subscribe(id =>{
      if (!id){
        Swal.fire({
          title: '¡Advertencia',
          text: 'El usuario actual no se encuentra registrado en el backend, puede que haya algunas funciones desactivadas.',
          icon: 'warning'
        });
        
      }
    })

  }
}
