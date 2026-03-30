import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@ApiSecurity('x-api-key')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check with database probe (requires x-api-key)' })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiResponse({
    status: 503,
    description: 'Database unreachable or query failed',
  })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
