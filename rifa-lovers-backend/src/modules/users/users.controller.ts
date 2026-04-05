import { Controller, Get, Patch, UseGuards, Query, Param, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { Roles, CurrentUser } from '../../common/decorators';
import { RolesGuard } from './guards/roles.guard';
import { UserRole, User } from '@prisma/client';
import { UpdateUserDto, UserResponseDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.authService.getProfile(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateProfile(userId, updateDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.usersService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
