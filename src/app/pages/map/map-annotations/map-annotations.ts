import { Component} from '@angular/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { AnnotationForm } from 'src/app/components/annotations/annotation-form/annotation-form.component';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Annotation } from 'src/app/models/annotations/annotation';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-map-annotations',
  imports: [MapComponent, AnnotationForm],
  templateUrl: './map-annotations.html',
  styleUrl: './map-annotations.scss',
  standalone: true,
})

export class MapAnnotationsViewer {
    constructor(private citizenService: CitizenService){}
    selectedPointCoordinates: [number, number] | null = null;
    selectedAnnotation: AnnotationForDisplay | null = null;

    selectNewPoint(coords: [number,number] | null){
        this.selectedPointCoordinates = coords;
        // Switching to create mode — clear any selected annotation
        this.selectedAnnotation = null;
    }

    async selectNewAnnotation(newAnnotation: Annotation | null){
        if (newAnnotation){
            // Switching to view mode — clear any new-point coordinates
            this.selectedPointCoordinates = null;

            const citizen = await firstValueFrom( this.citizenService.getById(newAnnotation.id_citizen));

            const date = new Date(newAnnotation.registration_date).toLocaleString('es-CO');

            const annotationToDisplay: AnnotationForDisplay ={
                description: newAnnotation.description,
                id_annotation: newAnnotation.id_annotation,
                citizen_name: citizen.name,
                neighborhood_name: "No hay servicio de barrios todavía :c",
                latitude: newAnnotation.latitude,
                longitude: newAnnotation.longitude,
                registration_date: date,
                status: newAnnotation.status,
            }

            this.selectedAnnotation = annotationToDisplay;
        }
    }

}


