import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';

@Injectable()
export class UtilityService {
  public generateFourDigitPin(): string {
    const min = 1000;
    const max = 9999;

    const randomPin = Math.floor(Math.random() * (max - min + 1)) + min;

    const fourDigitPin = randomPin.toString().padStart(4, '0');

    return fourDigitPin;
  }
  public async hashPassword(password: string): Promise<string> {
    return hashSync(password, 11);
  }

  public async comparePassword(newPassword: string, passwordHash: string): Promise<boolean> {
    try {
      return await compareSync(newPassword, passwordHash);
    } catch (error) {
      return false;
    }
  }
}
