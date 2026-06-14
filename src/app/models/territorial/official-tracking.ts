export interface OfficialTrackingPosition {
  id_official: number;
  latitude: number;
  longitude: number;
  last_gps_update: string;
}

export interface OfficialTrackingPayload {
  officials: OfficialTrackingPosition[];
}

export interface TrackedOfficialView {
  id: number;
  name: string;
  role: string;
  latitude: number | null;
  longitude: number | null;
  lastGpsUpdate: string | null;
  isOnline: boolean;
  address: string | null;
  initials: string;
}
