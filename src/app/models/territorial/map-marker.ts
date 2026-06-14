import { MapLocation } from "./map-location";

export interface MapMarker extends MapLocation {
    label?: string;
    id?: number | string;
    order?: number;
    selected?: boolean;
}