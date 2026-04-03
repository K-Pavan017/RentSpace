/**
 * Calculates the total rental price based on iterative discounts per day.
 * Day 1: 100% of base
 * Day 2: 90% of base
 * Day 3: 80% of base
 * ... and so on, with a minimum floor at 10% of base price.
 * 
 * @param {number} basePrice - The original 1-day/1-month rental price.
 * @param {number} days - The number of days/months for the rental.
 * @param {string} category - The item category (e.g., 'houses', 'cameras').
 * @returns {number} The total calculated price.
 */
export const calculateTotalRent = (basePrice, days, category = '') => {
  if (!basePrice || !days || days <= 0) return 0;
  
  const numDays = parseInt(days);

  // If the item is a House or similar monthly rental, don't apply iterative discount
  if (category?.toLowerCase() === 'houses') {
    return Math.round(basePrice * numDays);
  }
  
  let total = 0;
  for (let i = 1; i <= numDays; i++) {
    // Current day's price: basePrice - ((i - 1) * 0.1 * basePrice)
    // Floor the discount at 10% of base price to avoid negative or zero rates
    let dayRate = basePrice * (1 - (i - 1) * 0.1);
    const minRate = basePrice * 0.1; 
    
    if (dayRate < minRate) dayRate = minRate;
    
    total += dayRate;
  }

  return Math.round(total);
};
