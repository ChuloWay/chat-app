import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enum/enum.index';
import { UserUpdateError } from '../utils/AppError';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Creates a new user using the provided user data.
   *
   * @param {CreateUserDto} createUserDto - the data for creating the new user
   * @return {Promise<User>} a promise that resolves to the created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  /**
   * Finds a user by ID.
   *
   * @param {string} id - the ID of the user to find
   * @return {Promise<User | null>} a promise that resolves to the found user or null if not found
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ id }).select('-password -__v').exec();
      return user;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  /**
   * Finds a user by email.
   *
   * @param {string} email - the email of the user to find
   * @return {Promise<User | null>} a promise that resolves to the found user or null if not found
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Finds a user by phone number.
   *
   * @param {string} phoneNumber - the phone number of the user to find
   * @return {Promise<User | null>} a promise that resolves to the found user or null if not found
   */
  async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userModel.findOne({ phoneNumber }).select('-password -__v').exec();
  }

  async findUserByUsername(userName: string): Promise<User | null> {
    return this.userModel.findOne({ userName }).select('-password -__v').exec();
  }

  /**
   * Finds all users.
   *
   * @return {Promise<User[]>} a promise that resolves to an array of all users
   */
  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password -__v').exec();
  }

  async updateUserOnlineStatus(email: string, isOnline: boolean): Promise<User | null> {
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { email }, // Filter criteria: find user by email
          { isOnline }, // Update the isOnline field
          { new: true }, // Return the updated document
        )
        .select('-password -__v')
        .exec(); // Optionally, exclude sensitive fields

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user online status: ${error.message}`);
    }
  }

  /**
   * Updates the username or phone number of a user.
   *
   * @param {string} id - the ID of the user to update
   * @param {UpdateUserDto} updateUserDto - the data for updating the user
   * @return {Promise<User | null>} a promise that resolves to the updated user or null if not found
   */

  async updateUserProfile(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
        throw new HttpException('Empty payload', HttpStatus.BAD_REQUEST);
      }
      const { username, phoneNumber } = updateUserDto;
      const existingUser = await this.userModel.findById(id);
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const query = {
        $or: [{ username: username ?? existingUser.username }, { phoneNumber: phoneNumber ?? existingUser.phoneNumber }],
        _id: { $ne: id },
      };

      // Check for a user with conflicting username or phone number
      const conflictingUser = await this.userModel.findOne(query);
      if (conflictingUser) {
        if (conflictingUser.username === username) {
          throw new HttpException('Another user already has that username', HttpStatus.BAD_REQUEST);
        } else if (conflictingUser.phoneNumber === phoneNumber) {
          throw new HttpException('Another user already has that phone number', HttpStatus.BAD_REQUEST);
        }
      }

      const updateFields: Partial<User> = {};
      if (username !== null && existingUser.username !== username) {
        updateFields.username = username;
      }
      if (phoneNumber !== undefined && existingUser.phoneNumber !== phoneNumber) {
        updateFields.phoneNumber = phoneNumber;
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateFields, { new: true });

      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UserUpdateError('An error occurred while updating the user', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }


  async searchUsers(query: string): Promise<User[]> {
    // Find users matching the search query
    const user = await this.userModel.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } }
      ]
    }).exec();

    return user;
  }



  async getContacts(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).populate('contacts').exec();
    return user.contacts;
  }
}
