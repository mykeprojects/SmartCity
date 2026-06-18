import { Annotation } from '../territorial/annotation';
import * as L from 'leaflet';

export interface AnnotationForMarker{
    annotation: Annotation;
    active: boolean;
    marker: L.Marker;
    category?: number;
}