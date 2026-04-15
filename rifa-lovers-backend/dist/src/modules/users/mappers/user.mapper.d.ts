import type { User } from '@prisma/client';
import type { UserResponseDto } from '../dto';
export declare function mapUserToDto(user: User): UserResponseDto;
