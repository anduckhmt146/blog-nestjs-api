import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/LoginUser.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (!createUserDto) {
      throw new HttpException(
        'Token is missing or request data is null',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const findUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    const findUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (findUserByEmail || findUserByUsername) {
      throw new HttpException(
        'Email or username is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    if (!loginUserDto) {
      throw new HttpException(
        'Token is missing or request data is null',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const user = await this.userRepository.findOne({
      where: { username: loginUserDto.username },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });
    if (!user) {
      throw new HttpException(
        'Username is not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordValid = await compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Password is wrong. Please try again',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    delete user.password;
    return user;
  }

  generateJwtToken(user: UserEntity) {
    const jwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return sign(jwtPayload, process.env.JWT_SECRET);
  }
  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwtToken(user),
      },
    };
  }
  async findUserById(userID: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userID },
    });
    return user;
  }
  async getAllUser(): Promise<UserEntity[]> {
    const users = await this.userRepository.find();
    return users;
  }
  async updateUserById(
    userID: string,
    updateUser: UserEntity,
  ): Promise<UserEntity> {
    const user = await this.findUserById(userID);
    Object.assign(user, updateUser);
    return await this.userRepository.save(user);
  }
  async deleteUserById(userID: string): Promise<UserEntity> {
    const user = await this.findUserById(userID);
    return await this.userRepository.remove(user);
  }
}
