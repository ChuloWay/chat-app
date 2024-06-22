import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDTO } from './dto/login-auth.dto';
import { JwtAuthService } from './jwt/jwt.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UtilityService } from 'src/utils/utilityService';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtAuthService: JwtAuthService,
    private readonly utilityService: UtilityService,
  ) {}

  /**
   * A method to create a new user.
   *
   * @param {CreateUserDto} createUserDTO - the DTO containing user information
   * @return {Promise} a promise that resolves with the created user
   */
  async createUser(createUserDTO: CreateUserDto) {
    try {
      const { email, phoneNumber, username } = createUserDTO;

      // Check if email already exists
      const existingEmailUser = await this.userService.findUserByEmail(email);
      if (existingEmailUser) {
        throw new HttpException('An account with this email address already exists.', HttpStatus.BAD_REQUEST);
      }

      // Check if phone number already exists
      const existingPhoneNumberUser = await this.userService.findUserByPhoneNumber(phoneNumber);
      if (existingPhoneNumberUser) {
        throw new HttpException('An account with this phone number already exists.', HttpStatus.BAD_REQUEST);
      }

      // Check if username already exists
      const existingUsernameUser = await this.userService.findUserByUsername(username);
      if (existingUsernameUser) {
        throw new HttpException('An account with this username already exists.', HttpStatus.BAD_REQUEST);
      }

      return await this.userService.create(createUserDTO);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Perform user login and return user information and a token.
   *
   * @param {LoginUserDTO} loginUserDTO - the DTO containing user login information
   * @return {object} an object containing user information and a token
   */
  async login(loginUserDTO: LoginUserDTO) {
    try {
      // Get user information
      const user = await this.userService.findUserByEmail(loginUserDTO.email);

      console.log(user)

      // Check if user exists and compare passwords
      // const isValid = await this.utilityService.comparePassword(loginUserDTO.password, user?.password || '');
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const { email, username, isOnline , _id} = user;

      // Update user's online status
      await this.userService.updateUserOnlineStatus(email, true);

      // Create token
      const token = this.jwtAuthService.createToken({ email, username });

      return { user: { _id, email, username, isOnline }, token };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Perform user logout and update user's online status.
   *
   * @param {string} userId - the ID of the user logging out
   * @return {Promise} a promise that resolves when the user's status is updated
   */
  async logout(userId: string) {
    try {
      // Update user's online status to offline
      await this.userService.updateUserOnlineStatus(userId, false);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
