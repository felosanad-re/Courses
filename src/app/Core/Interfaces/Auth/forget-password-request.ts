export interface ForgetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
