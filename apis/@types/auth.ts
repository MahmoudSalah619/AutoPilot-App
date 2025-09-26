export interface AuthTokenResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface GetStoreUserParams {
  page_size: number;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface Vehicle {
  vehicleId: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  kilometers: number;
  isPrimary: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  created_at: string;
  updated_at: string;
  vehicle: Vehicle;
}

export interface UserProfileResponse {
  message: string;
  user: User;
}

export interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserInfoBody {
  name: string;
  email: string;
  bio: string;
  gender: string;
}
