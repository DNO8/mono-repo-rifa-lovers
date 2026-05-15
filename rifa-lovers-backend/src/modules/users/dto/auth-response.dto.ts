export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: number;
  role: string;
  status: string;
  organizationId?: string | null;
  organizationName?: string | null;
  createdAt: Date;
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken?: string;
}
