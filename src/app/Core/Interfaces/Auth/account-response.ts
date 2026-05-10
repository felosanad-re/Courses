export interface AccountResponse {
  exists: boolean;
  requiresOTP: boolean;
  canResetPassword: boolean;
  token: string;
}
