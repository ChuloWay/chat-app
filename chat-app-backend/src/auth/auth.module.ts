import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { JwtAuthService } from './jwt/jwt.service';
import { UtilityService } from 'src/utils/utilityService';
import { JwtStrategy } from './jwt/jwt.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'user', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '60', // 1 minute
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, UtilityService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
