import { Component} from '@angular/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { AnnotationForm } from 'src/app/components/annotations/annotation-form/annotation-form.component';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Annotation } from 'src/app/models/annotations/annotation';
import { CitizenService } from 'src/app/services/territorial/citizen.service';
import { Category } from 'src/app/models/territorial/category';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { InterestedPartyService } from 'src/app/services/territorial/interested-party.service';
import { EvidenceService } from 'src/app/services/territorial/evidence.service';
import { VoteFormComponent } from 'src/app/components/votes/vote-form/vote-form.component';

@Component({
  selector: 'app-map-annotations',
  imports: [MapComponent, AnnotationForm, VoteFormComponent],
  templateUrl: './map-annotations.html',
  styleUrl: './map-annotations.scss',
  standalone: true,
})

export class MapAnnotationsViewer {
    constructor(private citizenService: CitizenService, private annotationCategoryService: AnnotationCategoryService, private interestedPartiesService: InterestedPartyService, private evidenceService: EvidenceService){}
    selectedPointCoordinates: [number, number] | null = null;
    selectedAnnotation: AnnotationForDisplay | null = null;
    mapRefreshTrigger: number = 0;

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

            this.annotationCategoryService.getAnnotationCategoryByAnnotationId(newAnnotation.id_annotation).subscribe({
                next: (category) => {
                            const isSubCategory = (category?.id_parent_category != null);
                            let displayCategoryId: number | undefined;
                            if (category) {
                                // If it's a subcategory, use its parent id; otherwise use its own id
                                displayCategoryId = category.id_parent_category ?? category.id_category ?? undefined;
                    }

                    const annotationToDisplay: AnnotationForDisplay = {
                        description: newAnnotation.description,
                        id_annotation: newAnnotation.id_annotation,
                        citizen_name: citizen.name,
                        neighborhood_name: "No hay servicio de barrios todavía :c",
                        latitude: newAnnotation.latitude,
                        longitude: newAnnotation.longitude,
                        registration_date: date,
                        status: newAnnotation.status,
                        category: displayCategoryId,
                    };

                    if (isSubCategory && category) {annotationToDisplay.subCategory = category.id_category ?? undefined}

                    this.interestedPartiesService.getAnnotationParties(annotationToDisplay.id_annotation).subscribe({
                        next: (parties) => {
                            const interestedParties = parties.map(party => party.id_entity)
                            annotationToDisplay.interestedParties = interestedParties;
                            
                            this.evidenceService.getEvidencesByAnnotationId(annotationToDisplay.id_annotation).subscribe({
                                next: (evidences) => {
                                    annotationToDisplay.evidences = evidences ?? [];
                                    this.selectedAnnotation = annotationToDisplay;
                                },
                                error: (err) => {
                                    console.error('Error fetching evidences:', err);
                                    this.selectedAnnotation = annotationToDisplay;
                                }
                            });
                        },
                        error: (err) => {
                            console.error('Error fetching parties:', err);
                            
                            this.evidenceService.getEvidencesByAnnotationId(annotationToDisplay.id_annotation).subscribe({
                                next: (evidences) => {
                                    annotationToDisplay.evidences = evidences ?? [];
                                    this.selectedAnnotation = annotationToDisplay;
                                },
                                error: (err2) => {
                                    console.error('Error fetching evidences:', err2);
                                    this.selectedAnnotation = annotationToDisplay;
                                }
                            });
                        }
                    });
                },
                error: (err) => {
                    console.error('Error fetching category:', err);
                    const annotationToDisplay: AnnotationForDisplay = {
                        description: newAnnotation.description,
                        id_annotation: newAnnotation.id_annotation,
                        citizen_name: citizen.name,
                        neighborhood_name: "No hay servicio de barrios todavía :c",
                        latitude: newAnnotation.latitude,
                        longitude: newAnnotation.longitude,
                        registration_date: date,
                        status: newAnnotation.status,
                        category: undefined // Fallback: leave undefined when unknown
                    };
                    this.selectedAnnotation = annotationToDisplay;
                }
            });
        }
    }

    handleSubmit(newAnnotation: Annotation){
        this.selectNewAnnotation(newAnnotation);
        this.mapRefreshTrigger++;

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Nueva anotación creada con éxito',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

    }

}


