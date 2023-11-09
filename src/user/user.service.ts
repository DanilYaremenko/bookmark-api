import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto, GetUserDto } from './dto';
import { User } from '@prisma/client';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getMe(user: User) {
    const cachedData =
      await this.cacheService.get<GetUserDto>(
        `user${user.id}`,
      );

    if (cachedData) {
      return cachedData;
    }

    await this.cacheService.set(`user${user.id}`, user, 10);

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

    await this.cacheService.set(`user${userId}`, user, 10);

    return user;
  }
}
