import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BulkMarkAttendanceDto, MarkAttendanceDto } from './dto/mark-attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findAll(@Query('sessionId') sessionId?: string) {
    return this.attendanceService.findAll(sessionId);
  }

  @Post()
  mark(@Body() body: MarkAttendanceDto) {
    return this.attendanceService.mark(body);
  }

  @Post('bulk')
  bulkMark(@Body() body: BulkMarkAttendanceDto) {
    return this.attendanceService.bulkMark(body.records);
  }
}
