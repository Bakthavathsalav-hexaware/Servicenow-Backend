import { Controller, Get, Param } from '@nestjs/common'
import { ServiceNowService } from '../servicenow/servicenow.service'
 
@Controller('api/metrics')
export class MetricsController {
  constructor(
    private readonly serviceNowService: ServiceNowService,
  ) {}
 
  @Get(':id')
  async getMetric(@Param('id') id: string) {
    switch (id) {
      case 'M1':
        return this.getTotalOpenIncidents()
      default:
        return { message: 'Metric not implemented yet' }
    }
  }
 
  private async getTotalOpenIncidents() {
    const incidents = await this.serviceNowService.fetchTable(
      'incident',
      'active=true',
    )
 
    return {
      metric: 'M1',
      label: 'Total Open Incidents',
      count: incidents.length,
    }
  }
}