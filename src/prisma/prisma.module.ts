import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// ? Making the module available without typing imports. Don't forget to export it.
@Global()
@Module({
  // ? Providers are the services classes that do business logic.
  providers: [PrismaService],
  // ? To make the service importable in other files, you need to export it like this.
  exports: [PrismaService],
})
export class PrismaModule {}
