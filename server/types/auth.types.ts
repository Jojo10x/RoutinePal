// Request body for login
interface LoginRequestBody {
    username: string;
    password: string;
  }
  
  // Request body for registration
  interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
  }
  
  // Response structure for authentication
  interface AuthResponse {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }
  
  // JWT payload structure
  interface JWTPayload {
    id: string;
    iat?: number;
    exp?: number;
  }
  
  // Google OAuth Profile
  interface GoogleProfile {
    id: string;
    displayName: string;
    emails?: Array<{ value: string; verified: boolean }>;
    photos?: Array<{ value: string }>;
  }
  
  // Error Response
  interface ErrorResponse {
    message: string;
    status?: number;
    errors?: Record<string, string>;
  }
  