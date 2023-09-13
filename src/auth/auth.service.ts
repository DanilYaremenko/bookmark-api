import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
  signup() {
    return {msg: 'Я короче sign up'};
  }

  signin() {
      return {msg: 'Я короче sign in'};
  }
}