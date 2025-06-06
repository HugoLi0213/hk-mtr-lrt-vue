import { ref } from 'vue';

/**
 * Safely gets the string value from either a string or a ref
 */
export const getSearchValue = (search: any): string => {
  // Handle if it's a ref object with a value property
  if (search && typeof search === 'object' && 'value' in search) {
    return typeof search.value === 'string' ? search.value : '';
  }
  // Handle direct string case
  return typeof search === 'string' ? search : '';
};

/**
 * Test function to validate getSearchValue works correctly
 */
export const testGetSearchValue = (): void => {
  // Test with a string
  const stringValue = 'test';
  console.log(`String test: "${getSearchValue(stringValue)}" === "test"`);
  
  // Test with a ref
  const refValue = ref('test');
  console.log(`Ref test: "${getSearchValue(refValue)}" === "test"`);
  
  // Test with null
  console.log(`Null test: "${getSearchValue(null)}" === ""`);
  
  // Test with undefined
  console.log(`Undefined test: "${getSearchValue(undefined)}" === ""`);
  
  // Test with a number
  console.log(`Number test: "${getSearchValue(123)}" === ""`);
  
  // Test with an object that's not a ref
  console.log(`Object test: "${getSearchValue({})}" === ""`);
};
