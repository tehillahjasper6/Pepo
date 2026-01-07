import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NGOWishlistService } from './ngo-wishlist.service';

@Controller('api/ngo/:ngoId/wishlist')
export class NGOWishlistController {
  constructor(private wishlistService: NGOWishlistService) {}

  @Get()
  async getWishlist(@Param('ngoId') ngoId: string) {
    return this.wishlistService.getNGOWishlist(ngoId);
  }

  @Post()
  async addWishlistItem(@Param('ngoId') ngoId: string, @Body() data: any) {
    return this.wishlistService.createWishlistItem(ngoId, data);
  }
}
