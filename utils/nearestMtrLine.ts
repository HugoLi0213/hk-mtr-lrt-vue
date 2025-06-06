// Utility to get the nearest MTR line from user's location using exits.mtr.json
// This file is imported dynamically in MtrTrain.tsx

export async function getNearestMtrLine(
  userLat: number,
  userLng: number,
  MTR_LINES: Record<string, { stations: Record<string, any> }>
): Promise<string | null> {
  // Load exits data
  const exits: Array<{ station: string; lat: number; lng: number }> = await fetch('/exits.mtr.json').then(res => res.json());
  // Map: lineCode -> Set of station codes
  const lineStations: Record<string, Set<string>> = {};
  for (const [lineCode, line] of Object.entries(MTR_LINES)) {
    lineStations[lineCode] = new Set(Object.keys((line as any).stations));
  }
  // For each exit, find its line(s)
  const lineDistances: Record<string, number> = {};
  for (const exit of exits) {
    for (const [lineCode, stations] of Object.entries(lineStations)) {
      if ((stations as Set<string>).has(exit.station)) {
        // Compute distance
        const d = Math.sqrt(
          Math.pow(userLat - exit.lat, 2) + Math.pow(userLng - exit.lng, 2)
        );
        if (!(lineCode in lineDistances) || d < lineDistances[lineCode]) {
          lineDistances[lineCode] = d;
        }
      }
    }
  }
  // Find the line with the minimum distance
  let minDist = Infinity;
  let nearestLine: string | null = null;
  for (const [lineCode, dist] of Object.entries(lineDistances)) {
    if (typeof dist === 'number' && dist < minDist) {
      minDist = dist;
      nearestLine = lineCode;
    }
  }
  return nearestLine;
}
