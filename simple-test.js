// Simple test for time formatting
const now = new Date();
console.log('Current time:', now.toLocaleTimeString('zh-HK', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
}));

// Test case: 5 minutes from now
const fiveMinutesLater = new Date(now.getTime() + (5 * 60 * 1000));
console.log('5 minutes later:', fiveMinutesLater.toLocaleTimeString('zh-HK', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
}));

// Expected result should be something like "19:14 (5分鐘)"
const expectedResult = `${fiveMinutesLater.toLocaleTimeString('zh-HK', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
})} (5分鐘)`;

console.log('Expected combined format:', expectedResult);
