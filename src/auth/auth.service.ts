import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';

import { AuthDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // ? Dependency injection approach.
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      // ? Generate the password.
      const hashed = await argon.hash(dto.password);

      // ? Save the new user in the db.
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
        },
        select: {
          id: true,
          email: true,
          createAt: true,
        },
      });

      // ? Return the saved user.
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials taken');
      }
    }
  }

  async login(dto: AuthDto) {
    // ? Find the user by email.
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    // ? If the user does not exist, throw an exception.
    if (!user) {
      throw new ForbiddenException('Credential incorrect');
    }

    // ? Compare password
    const pwMatches = await argon.verify(user.password, dto.password);

    // ? If the password is incorrect, throw an error exception.
    if (!pwMatches) {
      throw new ForbiddenException('Credential incorrect');
    }

    // ? Send back the user.
    return await this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email: email };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('SECRET_KEY'),
    });

    return {
      access_token: token,
    };
  }
}
