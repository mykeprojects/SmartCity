import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-map-layout',
  imports: [RouterOutlet, MapComponent, RouterLink, RouterLinkActive],
  templateUrl: './map-layout.component.html',
  styleUrl: './map-layout.component.scss',
})
export class MapLayoutComponent {

}
