import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getBookmarks(userId: number) {
    const cachedData = await this.cacheService.get(`allBookmarks${userId}`);

    if (cachedData) {
      return cachedData;
    }

    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });

    await this.cacheService.set(`allBookmarks${userId}`, bookmarks, 10);

    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const cachedData = await this.cacheService.get(`bookmark${userId}`);

    if (cachedData) {
      return cachedData;
    }

    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });

    await this.cacheService.set(`bookmark${userId}`, bookmark, 10);

    return bookmark;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    await this.cacheService.set(`bookmark${userId}`, bookmark, 10);

    const log = await this.cacheService.delete(`allBookmarks${userId}`);

    return bookmark;
  }

  async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to this resource is forbidden');
    }

    await this.cacheService.set(`bookmark${userId}`, bookmark, 10);

    await this.cacheService.set(`allBookmarks${userId}`, bookmark, 0);

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to this resource is forbidden');
    }

    await this.cacheService.set(`allBookmarks${userId}`, bookmark, 0);
    await this.cacheService.set(`bookmark${userId}`, bookmark, 0);

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
