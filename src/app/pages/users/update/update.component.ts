import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-update',
  imports: [UserFormComponent],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  user?: User;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;
    console.log('ID del usuario a editar:', this.id);
    if (isNaN(this.id)) {
      this.router.navigate(['/users/list']);
      return;
    }

    this.usersService.getById(this.id).subscribe({
      next: (u) => {
        console.log('Usuario obtenido del servicio:', u);
        this.user = u;
      },
      error: () => this.router.navigate(['/users/list'])
    });
  }

  onUpdate(formValue: Partial<User>) {
    const payload: User = {
      id: this.id,
      ...(formValue as User)
    };

    this.usersService.update(this.id, payload).subscribe(() => {
      this.router.navigate(['/users/list']);
    });
  }

}
