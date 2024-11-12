export interface LoginCredentials {
    username: string;
    password: string;
  }
  
 export  interface AuthResponse {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }
  export interface ApiError {
    message: string;
    status?: number;
  }