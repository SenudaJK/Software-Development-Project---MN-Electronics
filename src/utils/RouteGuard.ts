/**
 * Utility service to handle route access control
 */

// Define route access mapping
const routeAccessMap: Record<string, string[]> = {
  // Public routes
  '/': ['public'],
  
  // Routes for both owner and technician
  '/customers': ['owner', 'technician'],
  '/myjobs': ['owner', 'technician'],
  '/warranty-jobs': ['owner', 'technician'],
  '/my-salary': ['owner', 'technician'],
  '/inventory/view-inventory': ['owner', 'technician'],
  '/view-invoice': ['owner', 'technician'],
  '/view-advance-invoice': ['owner', 'technician'],
  '/view-job-used-inventory': ['owner', 'technician'],
  '/purchase-items': ['owner', 'technician'],
  '/account/edit': ['owner', 'technician'],
  
  // Owner-only routes
  '/dashboard': ['owner'],
  '/repair-jobs': ['owner'],
  '/products': ['owner'],
  '/salary': ['owner'],
  '/register/register-job-customer': ['owner'],
  '/register-employee': ['owner'],
  '/add-inventory': ['owner'],
  '/inventory/inventory-batch': ['owner'],
  '/employees': ['owner'],
  '/invoice/advance-payment': ['owner'],
  '/invoice/full-payment': ['owner'],
  '/jobs': ['owner'],
  '/register-salary': ['owner'],
};

/**
 * Check if a user with the given role can access a specific route
 * @param path - Route path to check
 * @param role - User role
 * @returns boolean indicating if access is allowed
 */
export const canAccessRoute = (path: string, role: string): boolean => {
  // If no specific mapping exists, check if the path starts with a protected prefix
  const exactMatch = routeAccessMap[path];
  if (exactMatch) {
    return exactMatch.includes(role) || exactMatch.includes('public');
  }
  
  // Check for dynamic routes by trying to match prefixes
  const dynamicRoutePrefixes = Object.keys(routeAccessMap).filter(route => 
    route.includes(':') && path.startsWith(route.substring(0, route.indexOf(':')))
  );
  
  if (dynamicRoutePrefixes.length > 0) {
    // Use the most specific (longest) matching prefix
    const bestMatch = dynamicRoutePrefixes.sort((a, b) => b.length - a.length)[0];
    return routeAccessMap[bestMatch].includes(role) || routeAccessMap[bestMatch].includes('public');
  }
  
  // Default deny if no match
  return false;
};

/**
 * Get the default redirect path for a user based on their role
 */
export const getDefaultRedirectPath = (role: string): string => {
  switch(role) {
    case 'owner':
      return '/dashboard';
    case 'technician':
      return '/myjobs';
    default:
      return '/';
  }
};

// Export the routeAccessMap for reference
export { routeAccessMap };