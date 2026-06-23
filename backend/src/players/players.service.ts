import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.player.findMany({
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async create(dto: CreatePlayerDto) {
    return this.prisma.player.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        jerseyNumber: dto.jerseyNumber,
        position: dto.position,
        photo: dto.photo,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: UpdatePlayerDto) {
    await this.findOne(id); // Throws if not found

    return this.prisma.player.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        jerseyNumber: dto.jerseyNumber,
        position: dto.position,
        photo: dto.photo,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found

    return this.prisma.player.delete({
      where: { id },
    });
  }
}
