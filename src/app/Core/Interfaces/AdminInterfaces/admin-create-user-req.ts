export interface AdminCreateUserReq {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
  role: string;
  specialization: string;
}
