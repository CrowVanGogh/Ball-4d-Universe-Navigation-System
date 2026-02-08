// bladen-county-anchor.ts
// Defines the origin anchor for the Ball4D harmonic Earth mesh
// Anchored to air rights 300 feet above the land boundary survey

export interface AnchorParcel {
  address: string;
  owner: string;
  county: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  airRights: {
    height: number; // in feet
    waypointElevation: number; // ground elevation + air rights height
  };
  parcelID?: string;
  harmonicOrigin: {
    x: number;
    y: number;
    z: number;
  };
  boundarySurvey?: {
    corners: Array<{ lat: number; lon: number }>;
    area: number; // in acres
    legalDescription: string;
  };
}

export const bladenCountyAnchor: AnchorParcel = {
  address: '16524 Highway 53 East',
  owner: 'Randolph Crow',
  county: 'Bladen County',
  state: 'North Carolina',
  zipCode: '28448',
  coordinates: {
    latitude: 34.6204, // Approximate - will be updated with exact GIS data
    longitude: -78.3892, // Approximate - will be updated with exact GIS data
    elevation: 85 // Approximate ground elevation in feet - to be updated from survey
  },
  airRights: {
    height: 300, // 300 feet above ground
    waypointElevation: 385 // 85 (ground) + 300 (air rights) = 385 feet MSL
  },
  parcelID: '', // To be populated from Bladen County Register of Deeds
  harmonicOrigin: {
    x: 0,
    y: 0,
    z: 0 // Anchored at 300 feet above the land boundary survey
  },
  boundarySurvey: {
    corners: [], // To be populated from official land survey
    area: 0, // To be populated from deed records
    legalDescription: 'To be populated from Bladen County Register of Deeds'
  }
};

/**
 * Convert any lat/long coordinate to harmonic coordinates
 * relative to the Bladen County anchor waypoint (300 feet above ground)
 */
export function latLongToHarmonic(
  lat: number,
  lon: number,
  elevation: number = 0
): { x: number; y: number; z: number } {
  const PHI = 1.618033988749895;
  const GOLDEN_ANGLE = 137.5077640500378;

  // Calculate offset from anchor waypoint (at 300 feet above ground)
  const latOffset = lat - bladenCountyAnchor.coordinates.latitude;
  const lonOffset = lon - bladenCountyAnchor.coordinates.longitude;
  const elevOffset = elevation - bladenCountyAnchor.airRights.waypointElevation;

  // Convert to harmonic coordinates using phi-based transforms
  const radius = Math.sqrt(latOffset * latOffset + lonOffset * lonOffset) * PHI * 111000; // 111km per degree
  const theta = Math.atan2(lonOffset, latOffset) * (180 / Math.PI);
  const spiralAngle = (theta + GOLDEN_ANGLE) % 360;

  return {
    x: radius * Math.cos(spiralAngle * Math.PI / 180),
    y: radius * Math.sin(spiralAngle * Math.PI / 180),
    z: elevOffset * PHI / 100 // Scale elevation harmonically
  };
}

/**
 * Get the waypoint marker coordinates (300 feet above land boundary)
 */
export function getWaypointMarker(): {
  latitude: number;
  longitude: number;
  elevation: number;
  harmonicCoordinates: { x: number; y: number; z: number };
} {
  return {
    latitude: bladenCountyAnchor.coordinates.latitude,
    longitude: bladenCountyAnchor.coordinates.longitude,
    elevation: bladenCountyAnchor.airRights.waypointElevation,
    harmonicCoordinates: bladenCountyAnchor.harmonicOrigin
  };
}

/**
 * Calculate harmonic distance from waypoint marker
 */
export function harmonicDistanceFromWaypoint(
  lat: number,
  lon: number,
  elevation: number = 0
): number {
  const harmonicCoords = latLongToHarmonic(lat, lon, elevation);
  return Math.sqrt(
    harmonicCoords.x * harmonicCoords.x +
    harmonicCoords.y * harmonicCoords.y +
    harmonicCoords.z * harmonicCoords.z
  );
}

export default bladenCountyAnchor;