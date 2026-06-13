import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="cardWithShadow theme-card" *ngIf="user">
      <div class="p-6 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <mat-card-title class="mb-0">Mi perfil</mat-card-title>
        <button mat-flat-button color="primary" routerLink="/account/settings">Editar cuenta</button>
      </div>
      <mat-card-content class="p-6">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <img
            [src]="user.photoURL || '/assets/images/profile/user-1.jpg'"
            alt="Foto de perfil"
            class="rounded-full object-cover size-20" />
          <div>
            <h2 class="text-xl font-semibold m-0">{{ user.displayName || 'Usuario' }}</h2>
            <p class="text-muted m-0 mt-1">{{ user.email }}</p>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6">
            <p class="text-sm text-muted mb-1">Nombre</p>
            <p class="font-medium m-0">{{ user.displayName || 'Sin nombre configurado' }}</p>
          </div>
          <div class="col-span-12 md:col-span-6">
            <p class="text-sm text-muted mb-1">Correo</p>
            <p class="font-medium m-0">{{ user.email || '-' }}</p>
          </div>
          <div class="col-span-12 md:col-span-6">
            <p class="text-sm text-muted mb-1">Estado de verificación</p>
            <p class="font-medium m-0">{{ user.emailVerified ? 'Verificado' : 'Pendiente' }}</p>
          </div>
          <div class="col-span-12 md:col-span-6">
            <p class="text-sm text-muted mb-1">Último acceso</p>
            <p class="font-medium m-0">{{ lastSignIn }}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
    <p *ngIf="!user" class="p-6">Cargando perfil...</p>
  `,
})
export class AccountProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  lastSignIn = '-';
  private userSubscription?: Subscription;

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.securityService.getUser().subscribe((user) => {
      if (!user) {
        this.router.navigate(['/authentication/login']);
        return;
      }
      this.user = user;
      this.lastSignIn = user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString()
        : '-';
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
