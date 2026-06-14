import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { SecurityService } from 'src/app/services/security.service';
import { showSuccess } from 'src/app/services/territorial/territorial-api.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-card class="cardWithShadow theme-card" *ngIf="user">
      <div class="p-6 border-b border-border">
        <mat-card-title class="mb-0">Mi cuenta</mat-card-title>
        <p class="text-sm text-muted mt-2 mb-0">Actualice su nombre visible en la aplicación.</p>
      </div>
      <mat-card-content class="p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-12 gap-x-6">
            <div class="col-span-12 lg:col-span-6">
              <mat-label class="font-semibold mb-2 block">Correo</mat-label>
              <mat-form-field appearance="outline" class="w-full">
                <input matInput [value]="user.email || ''" readonly />
              </mat-form-field>
            </div>
            <div class="col-span-12 lg:col-span-6">
              <mat-label class="font-semibold mb-2 block">Nombre visible</mat-label>
              <mat-form-field appearance="outline" class="w-full">
                <input matInput formControlName="displayName" />
              </mat-form-field>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving">
              Guardar cambios
            </button>
            <button mat-flat-button color="warn" type="button" routerLink="/account/profile">Cancelar</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
    <p *ngIf="!user" class="p-6">Cargando cuenta...</p>
  `,
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  form!: FormGroup;
  saving = false;
  private userSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      displayName: ['', [Validators.required, Validators.maxLength(160)]],
    });

    this.userSubscription = this.securityService.getUser().subscribe((user) => {
      if (!user) {
        this.router.navigate(['/authentication/login']);
        return;
      }
      this.user = user;
      this.form.patchValue({ displayName: user.displayName ?? '' });
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.securityService
      .updateDisplayName(this.form.value.displayName)
      .then(() => {
        this.saving = false;
        showSuccess('Actualizado', 'Su nombre se actualizó correctamente.');
        this.router.navigate(['/account/profile']);
      })
      .catch((err) => {
        this.saving = false;
        Swal.fire('Error', err?.message || 'No se pudo actualizar la cuenta.', 'error');
      });
  }
}
