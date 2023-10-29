import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto, GetUserDto } from './dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async getMe(user: User) {
    const cachedData =
      await this.cacheService.get<GetUserDto>(
        `user${user.id}`,
      );

    if (cachedData) {
      return cachedData;
    }

    await this.cacheService.set(`user${user.id}`, user);

    return user;
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    await this.cacheService.set(`user${userId}`, user);

    return user;
  }
}
