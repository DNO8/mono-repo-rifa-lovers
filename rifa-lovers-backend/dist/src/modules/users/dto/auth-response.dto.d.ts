export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: number;
    role: string;
    status: string;
    createdAt: Date;
}
export declare class AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken?: string;
}
