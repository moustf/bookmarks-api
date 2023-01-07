import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return {
      msg: 'Hello from signup endpoint',
    };
  }

  login() {
    return {
      msg: 'Hello from login endpoint',
    };
  }
}
