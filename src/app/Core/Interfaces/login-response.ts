export interface LoginResponse {
  userName: string;
  email: string;
  token: string;
  isAuthenticated: boolean;
  roles: string[];
}