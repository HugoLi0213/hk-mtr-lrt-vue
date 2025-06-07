// Simple test script to verify theme functionality
// This can be run in browser console to test theme switching

console.log('Testing Theme Switching Functionality...');

// Test if data-theme attribute changes
function testThemeSwitch() {
  const html = document.documentElement;
  
  console.log('Current theme:', html.getAttribute('data-theme'));
  
  // Test setting light theme
  html.setAttribute('data-theme', 'light');
  console.log('Set to light theme:', html.getAttribute('data-theme'));
  
  // Wait a moment then test dark theme
  setTimeout(() => {
    html.setAttribute('data-theme', 'dark');
    console.log('Set to dark theme:', html.getAttribute('data-theme'));
    
    // Test CSS variables
    const rootStyles = getComputedStyle(html);
    console.log('CSS Variables:');
    console.log('--color-background:', rootStyles.getPropertyValue('--color-background'));
    console.log('--color-text:', rootStyles.getPropertyValue('--color-text'));
    console.log('--color-primary:', rootStyles.getPropertyValue('--color-primary'));
    
  }, 1000);
}

// Test localStorage functionality
function testLocalStorage() {
  // Test theme storage
  localStorage.setItem('mtr-app-theme', 'dark');
  console.log('Stored theme:', localStorage.getItem('mtr-app-theme'));
  
  // Test font size storage
  localStorage.setItem('mtr-app-font-size', '18');
  console.log('Stored font size:', localStorage.getItem('mtr-app-font-size'));
}

// Run tests
testThemeSwitch();
testLocalStorage();

console.log('Theme tests completed. Check the HTML data-theme attribute and CSS variables.');
