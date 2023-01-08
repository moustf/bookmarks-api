import { Module, Get } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';

@Module({
  // ? Just declare the module here and then customize it in the auth provider. Refresh tokens.
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {
  @Get()
  getDat(): string {
    return 'hello world';
  }
}
