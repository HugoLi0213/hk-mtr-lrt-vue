/**
 * Utility functions for the hk-mtr-lrt-app-vue application
 */

/**
 * Converts a string to proper case (first letter of each word capitalized)
 * @param txt The string to convert
 * @returns The string in proper case
 */
export const toProperCase = (txt: string): string => {
  if (!txt) return '';
  
  return txt
    .split(" ")
    .map((word) => {
      if (word.match("^[A-Za-z]+$")) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
      } else {
        return word;
      }
    })
    .join(" ");
};

/**
 * Calculates the distance between two geographic locations
 * @param a First location with lat and lng properties
 * @param b Second location with lat and lng properties
 * @returns Distance in meters
 */
export const getDistance = (a: { lat: number, lng: number }, b: { lat: number, lng: number }): number => {
  const R = 6371e3; // metres
  const φ1 = (a.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const aa =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c; // in metres
};

/**
 * Formats a distance with appropriate units
 * @param distanceInMetre Distance in meters
 * @returns Object with distance value, unit, and decimal places
 */
export const getDistanceWithUnit = (distanceInMetre: number) => {
  const isKm = distanceInMetre >= 1000;
  return {
    distance: isKm ? distanceInMetre / 1000 : distanceInMetre,
    unit: isKm ? "公里" : "米",
    decimalPlace: isKm ? 1 : 0,
  };
};

/**
 * Default geolocation for Hong Kong
 */
export const DEFAULT_GEOLOCATION = {
  lat: 22.302711,
  lng: 114.177216,
};

/**
 * Vibrate the device if supported
 * @param duration Vibration duration in milliseconds
 */
export const vibrate = (duration: number) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    navigator.vibrate?.(duration);
  }
};

/**
 * Get platform symbol for MTR/LRT
 * @param number Platform number
 * @param mode Platform symbol mode
 * @returns Platform symbol
 */
export const getPlatformSymbol = (number: number, mode: string = 'number') => {
  if (mode === 'number') {
    return number.toString();
  }
  
  // Alternative platform symbol modes could be implemented here
  return number.toString();
};

/**
 * Safely gets the string value from either a string or a Vue ref
 * This helps handle cases where injected values might be refs or direct values
 * @param search The value to extract a string from (could be string or ref)
 * @returns The string value
 */
export const getSearchValue = (search: any): string => {
  // Handle if it's a ref object with a value property
  if (search && typeof search === 'object' && 'value' in search) {
    return typeof search.value === 'string' ? search.value : '';
  }
  // Handle direct string case
  return typeof search === 'string' ? search : '';
};
