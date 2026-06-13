import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-map-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './map-layout.component.html',
  styleUrl: './map-layout.component.scss',
})
export class MapLayoutComponent {

}
