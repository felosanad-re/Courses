export interface UserProfileResponse {
  id: string;
  lastName: string;
  firstName: string;
  address: string;
  email: string;
  birthday: Date;
  emailConfirmed: boolean;
  userName: string;
  phoneNumber: string;
  userRoles: string[];
}
