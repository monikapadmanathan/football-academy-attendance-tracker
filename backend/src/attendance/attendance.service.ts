import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(sessionId?: string) {
    return this.prisma.attendance.findMany({
      where: sessionId ? { sessionId } : undefined,
      include: {
        player: true,
        session: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  mark(dto: MarkAttendanceDto) {
    return this.prisma.attendance.upsert({
      where: {
        playerId_sessionId: {
          playerId: dto.playerId,
          sessionId: dto.sessionId,
        },
      },
      update: {
        status: dto.status as AttendanceStatus,
        notes: dto.notes,
      },
      create: {
        playerId: dto.playerId,
        sessionId: dto.sessionId,
        status: dto.status as AttendanceStatus,
        notes: dto.notes,
      },
      include: {
        player: true,
        session: true,
      },
    });
  }

  bulkMark(records: MarkAttendanceDto[]) {
    return this.prisma.$transaction(
      records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            playerId_sessionId: {
              playerId: record.playerId,
              sessionId: record.sessionId,
            },
          },
          update: {
            status: record.status as AttendanceStatus,
            notes: record.notes,
          },
          create: {
            playerId: record.playerId,
            sessionId: record.sessionId,
            status: record.status as AttendanceStatus,
            notes: record.notes,
          },
        }),
      ),
    );
  }
}
