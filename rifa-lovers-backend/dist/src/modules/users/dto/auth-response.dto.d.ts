export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    status: string;
    organizationId?: string | null;
    organizationName?: string | null;
    createdAt: Date;
}
export declare class AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
    requiresEmailConfirmation?: boolean;
}
