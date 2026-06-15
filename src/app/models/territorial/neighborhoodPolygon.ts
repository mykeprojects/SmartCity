import { Point } from "./point";
export interface NeighborhoodPolygon{
    id_neighborhood: number,
    name_neighborhood: string,
    id_commune: number,
    polygon_points: Point[],
    
}