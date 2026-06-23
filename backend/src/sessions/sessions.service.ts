import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async create(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        title: dto.title,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        ageGroup: dto.ageGroup,
      },
    });
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findOne(id);

    return this.prisma.session.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        startTime: dto.startTime,
        endTime: dto.endTime,
        ageGroup: dto.ageGroup,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.session.delete({
      where: { id },
    });
  }
}
