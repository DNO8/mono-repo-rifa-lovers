import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UpdateUserDto, UserResponseDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    private readonly authService;
    constructor(usersService: UsersService, authService: AuthService);
    getMe(userId: string): Promise<UserResponseDto>;
    updateMe(userId: string, updateDto: UpdateUserDto): Promise<UserResponseDto>;
    findAll(skip?: string, take?: string): Promise<{
        id: string;
        organizationId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: number | null;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: number | null;
        role: import("@prisma/client").$Enums.UserRole;
    } | null>;
}
