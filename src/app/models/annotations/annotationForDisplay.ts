import { Evidence } from "../territorial/evidence";

export class AnnotationForDisplay {
    description: string;
    id_annotation: number;
    id_citizen: number;
    citizen_name: string;
    neighborhood_name: string;
    category?: number;
    subCategory?: number;
    interestedParties?: number[];
    latitude: number;
    longitude: number;
    registration_date: string;
    status: string;
    evidences?: Evidence[];
}