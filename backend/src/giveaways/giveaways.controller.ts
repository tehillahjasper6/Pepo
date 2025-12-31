import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { GiveawaysService } from './giveaways.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('giveaways')
@Controller('giveaways')
export class GiveawaysController {
  constructor(private giveawaysService: GiveawaysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new giveaway' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Request() req,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.giveawaysService.create(req.user.id, body, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all giveaways (feed)' })
  async findAll(@Query() filters: any) {
    return this.giveawaysService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single giveaway' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.giveawaysService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update giveaway' })
  async update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.giveawaysService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete/Cancel giveaway' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.giveawaysService.delete(id, req.user.id);
  }

  @Post(':id/interest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Express interest - Join draw (I'm Interested)" })
  async expressInterest(@Param('id') id: string, @Request() req) {
    return this.giveawaysService.expressInterest(id, req.user.id);
  }

  @Delete(':id/interest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw interest' })
  async withdrawInterest(@Param('id') id: string, @Request() req) {
    return this.giveawaysService.withdrawInterest(id, req.user.id);
  }
}

