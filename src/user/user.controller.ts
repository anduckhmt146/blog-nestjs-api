import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  UseGuards,
  ValidationPipe,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/LoginUser.dto';
import { UserEntity } from './user.entity';
import { User } from './decorators/user.decorator';
import { AuthGuard } from './guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Register
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  // Login
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  // Get User By Id (Token)
  @Get('detail')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async getUserById(@User() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  // Get All Users (Token)
  @Get('all')
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userService.getAllUser();
  }

  // Update User By Id (Token)
  @Put('detail')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') curentUser: string,
    @Body('user') user: UserEntity,
  ): Promise<UserEntity> {
    return await this.userService.updateUserById(curentUser, user);
  }

  // Delete User By Id
  @Delete(':id')
  async deteleUserById(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.deleteUserById(id);
  }
}
