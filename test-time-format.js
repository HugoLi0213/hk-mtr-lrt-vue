// Test script to verify the time formatting function
console.log('Testing LRT time formatting function...');

// Helper function to calculate minutes between two times
const calculateMinutesDifference = (arrivalTime) => {
  const now = new Date();
  const diffMs = arrivalTime.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60));
}

// Copy of the getFormattedArrivalTime function
const getFormattedArrivalTime = (route) => {
  if (!route) return '-'
  
  try {
    console.log('=== DEBUG: Route data ===', JSON.stringify(route, null, 2))
    
    // Check if route has direct time fields
    const timeFields = ['time_ch', 'time_en', 'arrival_time', 'eta', 'time'];
    let timeValue = null;
    
    for (const field of timeFields) {
      if (route[field] !== undefined && route[field] !== null && route[field] !== '') {
        timeValue = route[field];
        console.log(`=== Found time in field '${field}':`, timeValue, typeof timeValue);
        break;
      }
    }
    
    if (!timeValue) {
      console.log('=== No time field found in route ===', Object.keys(route));
      return '-';
    }
    
    console.log('=== Processing timeValue ===', timeValue, typeof timeValue);
    
    // SPECIAL CHECK: If it's EXACTLY a relative time format like "5分鐘"
    if (typeof timeValue === 'string' && /^\d+分鐘$/.test(timeValue.trim())) {
      console.log('=== EXACT MATCH: Pure relative time ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)分鐘/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        console.log('=== Extracted minutes ===', minutes);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== EXACT MATCH Result ===`, result);
        return result;
      }
    }
    
    // Case 1: If it's already in HH:MM format (exact time) - calculate countdown
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}$/)) {
      console.log('Time is already in HH:MM format:', timeValue);
      // Calculate minutes until arrival
      const [hours, minutes] = timeValue.split(':').map(Number);
      const today = new Date();
      const arrivalTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      
      // If arrival time is in the past, assume it's tomorrow
      if (arrivalTime < today) {
        arrivalTime.setDate(arrivalTime.getDate() + 1);
      }
      
      const minutesLeft = calculateMinutesDifference(arrivalTime);
      if (minutesLeft > 0) {
        return `${timeValue} (${minutesLeft}分鐘)`;
      } else {
        return `${timeValue} (即將到達)`;
      }
    }
    
    // Case 2: If it's in full datetime format "2025-06-07 14:30:00"
    if (typeof timeValue === 'string' && timeValue.includes('-') && timeValue.includes(' ')) {
      const arrivalTime = new Date(timeValue);
      if (!isNaN(arrivalTime.getTime())) {
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const minutesLeft = calculateMinutesDifference(arrivalTime);
        console.log('Parsed datetime to:', exactTime);
        if (minutesLeft > 0) {
          return `${exactTime} (${minutesLeft}分鐘)`;
        } else {
          return `${exactTime} (即將到達)`;
        }
      }
    }    
    // Case 3: If it's relative time like "6分鐘", calculate exact time
    if (typeof timeValue === 'string' && timeValue.includes('分鐘')) {
      console.log('=== Case 3: Relative time detected ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)分鐘/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        console.log('=== Extracted minutes ===', minutes);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== Case 3 Result ===`, result);
        return result;
      } else {
        console.log('=== Case 3: No minutes match found ===');
      }
    }
    
    // Case 4: If it's "即將到達" or similar
    if (typeof timeValue === 'string' && (timeValue.includes('即將') || timeValue.includes('Arriving'))) {
      const now = new Date();
      const exactTime = now.toLocaleTimeString('zh-HK', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      console.log('Immediate arrival:', exactTime);
      return `${exactTime} (即將到達)`;
    }
    
    // Case 5: If it's a timestamp (number)
    if (typeof timeValue === 'number') {
      const arrivalTime = new Date(timeValue * 1000); // Convert from Unix timestamp
      if (!isNaN(arrivalTime.getTime())) {
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const minutesLeft = calculateMinutesDifference(arrivalTime);
        console.log('Parsed timestamp to:', exactTime);
        if (minutesLeft > 0) {
          return `${exactTime} (${minutesLeft}分鐘)`;
        } else {
          return `${exactTime} (即將到達)`;
        }
      }
    }    
    // Final safety check: If we reach here and timeValue contains 分鐘, force the conversion
    if (typeof timeValue === 'string' && timeValue.includes('分鐘')) {
      console.log('=== SAFETY CHECK: Forcing time conversion for ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== SAFETY CHECK Result ===`, result);
        return result;
      }
    }
    
    // Fallback: return the original value
    console.log('=== FALLBACK: Using original timeValue ===', timeValue);
    return String(timeValue);
    
  } catch (error) {
    console.error('=== ERROR in getFormattedArrivalTime ===', error);
    console.log('=== Route object ===', route);
    return route.time_ch || route.time_en || '-';
  }
}

// Test cases
console.log('\n=== Testing different time formats ===');

// Test 1: Pure relative time
console.log('\n--- Test 1: Pure relative time "5分鐘" ---');
const result1 = getFormattedArrivalTime({ time_ch: '5分鐘' });
console.log('Result:', result1);

// Test 2: HH:MM format
console.log('\n--- Test 2: HH:MM format "14:30" ---');
const result2 = getFormattedArrivalTime({ time_ch: '14:30' });
console.log('Result:', result2);

// Test 3: Immediate arrival
console.log('\n--- Test 3: Immediate arrival "即將到達" ---');
const result3 = getFormattedArrivalTime({ time_ch: '即將到達' });
console.log('Result:', result3);

// Test 4: Multiple format possibilities
console.log('\n--- Test 4: Multiple fields with time_en ---');
const result4 = getFormattedArrivalTime({ 
  time_ch: '', 
  time_en: '8分鐘',
  arrival_time: null 
});
console.log('Result:', result4);

console.log('\n=== Testing completed ===');
