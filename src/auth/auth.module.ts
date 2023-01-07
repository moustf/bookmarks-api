import { Module, Get } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  @Get()
  getDat(): string {
    return 'hello world';
  }
}
