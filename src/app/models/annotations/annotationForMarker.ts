import { Annotation } from "./annotation";
import * as L from 'leaflet';

export interface AnnotationForMarker{
    annotation: Annotation;
    active: boolean;
    marker: L.Marker;
}