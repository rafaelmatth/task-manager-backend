import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class HealthResponse {
  status: string;
  timestamp: string;
  message: string;
}

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is running correctly',
    type: HealthResponse
  })
  check(): HealthResponse {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Task Manager API is running' 
    };
  }
}
