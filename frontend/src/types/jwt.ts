export interface JwtResponse {
  token: string;
  type?: string; // usually 'Bearer'
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
}
