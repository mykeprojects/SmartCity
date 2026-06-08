import { Component} from '@angular/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { AnnotationForm } from 'src/app/components/annotations/annotation-form/annotation-form.component';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Annotation } from 'src/app/models/annotations/annotation';

@Component({
  selector: 'app-map-annotations',
  imports: [MapComponent, AnnotationForm],
  templateUrl: './map-annotations.html',
  standalone: true,
})

export class MapAnnotationsViewer {
    selectedPoint = false;
}


