import { Point } from "src/app/models/territorial/point";
import { Annotation } from 'src/app/models/territorial/annotation';
import { Neighborhood } from "src/app/models/territorial/neighborhood";
import { AnnotationCategory } from "src/app/models/territorial/annotation-category";
import { Category } from "src/app/models/territorial/category";

export function isPointInPolygon(latitude: number, longitude: number, polygonPoints: Point[]){
  const x = longitude;
  const y = latitude;
  let inside = false;

  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i].longitude as number;
    const yi = polygonPoints[i].latitude as number;

    const xj = polygonPoints[j].longitude as number;
    const yj = polygonPoints[j].latitude as number;

    const intersect =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + xi - xi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function createColoredIcon(category: string): L.DivIcon {
    const color = getColorFromString(category);

    return L.divIcon({
        className: '',
        html: `
        <svg viewBox="0 0 25 41">
            <path
            d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.8 12.5 41 12.5 41S25 21.8 25 12.5C25 5.6 19.4 0 12.5 0Z"
            fill="${color}"
            stroke="black"
            stroke-width="1"
            />
        </svg>
        `,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}

export function getColorFromString(text: string): string {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;

    return `hsl(${hue}, 70%, 50%)`;
}

export function isAnnotationNeighborhoodAllowed(annotation: Annotation, neighborhoods: Neighborhood[], filterSelectedCommune: number | null | undefined, filterSelectedNeighborhood: number | null | undefined): boolean{
    if (!filterSelectedCommune){
      return true;
    }
    if (!annotation.id_neighborhood){
      return false;
    }
    const allowedNeighborhoods = filterNeighborhoods(neighborhoods, filterSelectedCommune, filterSelectedNeighborhood);
    const found = allowedNeighborhoods.find(neighborhood => neighborhood.id_neighborhood === annotation.id_neighborhood)
    return (!!found);
}

export function filterNeighborhoods(neighborhoods: Neighborhood[], filterSelectedCommune: number | null | undefined, filterSelectedNeighborhood: number | null | undefined): Neighborhood[]{
    const filteredNeighborhoods: Neighborhood[] = [];
    if (!filterSelectedCommune){
      return neighborhoods;
    }
    else {
      if (!filterSelectedNeighborhood){
        return neighborhoods.filter(neighborhood => neighborhood.id_commune === filterSelectedCommune)
      }
      const selectedNeighborhood = neighborhoods.find(neighborhood => neighborhood.id_neighborhood === filterSelectedNeighborhood)
      if (selectedNeighborhood){
        filteredNeighborhoods.push(selectedNeighborhood);
      }
    }
    return filteredNeighborhoods;
}

export function getCustomIcon(): L.Icon{
    return L.icon({
                iconUrl: 'assets/images/leaflet/marker-icon.png',
                iconRetinaUrl: 'assets/images/leaflet/marker-icon-2x.png',
                shadowUrl: 'assets/images/leaflet/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
}

export function createMarkerIcon(annotation: Annotation, annotationCategories: AnnotationCategory[],categories: Category[]): L.Icon | L.DivIcon{
    const foundCategoryAnnotation = annotationCategories.find(annotationCategory => annotation.id_annotation == annotationCategory.id_annotation)
    if (!foundCategoryAnnotation || !foundCategoryAnnotation.id_category) {
        return getCustomIcon();
    }
    const foundCategory = categories.find(category => category.id_category == foundCategoryAnnotation.id_category)

    if (foundCategory?.id_parent_category){
        const foundParentCategory = categories.find(category => category.id_category == foundCategory.id_parent_category)
        if (foundParentCategory?.name){
        return createColoredIcon(foundParentCategory?.name);
        }
        return getCustomIcon();
    }
    if (foundCategory?.name){
        return createColoredIcon(foundCategory.name);
    }
    return getCustomIcon();
}