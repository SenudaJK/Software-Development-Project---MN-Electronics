export interface User {
  id: string | number;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  phoneNumbers?: string[];
  name?: string;  // For backward compatibility
  phone?: string; // For backward compatibility
  address?: string; // For backward compatibility
}