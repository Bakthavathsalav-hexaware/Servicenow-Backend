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
      case 'M6':
        return this.getUnassignedTickets()
      case 'M10':
        return this.getStaleTickets()
      case 'M2':
        return this.getPriorityDistribution()
      case 'M4':
        return this.getCategoryDistribution()
      default:
        return {
          message: 'Metric not implemented',
        }
    }
  }
 
  // =========================
  // M1: Total Open Incidents
  // =========================
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
 
  // =========================
  // M6: Unassigned Tickets
  // =========================
  private async getUnassignedTickets() {
    const incidents = await this.serviceNowService.fetchTable(
      'incident',
      'active=true^assigned_toISEMPTY',
    )
 
    return {
      metric: 'M6',
      label: 'Unassigned Tickets',
      count: incidents.length,
    }
  }
 
  // =========================
  // M10: Stale Tickets (>30 days)
  // =========================
  private async getStaleTickets() {
    const incidents = await this.serviceNowService.fetchTable(
      'incident',
      'active=true^sys_updated_on<javascript:gs.daysAgoStart(30)',
    )
 
    return {
      metric: 'M10',
      label: 'Stale Tickets (>30d)',
      count: incidents.length,
    }
  }
  // M2: Volume by Priority (Pie Chart)
private async getPriorityDistribution() {
  const incidents = await this.serviceNowService.fetchTable(
    'incident',
    'active=true',
  )
 
  const priorityMap: Record<string, number> = {}
 
  incidents.forEach((inc: any) => {
    const priority = inc.priority || 'Unknown'
    priorityMap[priority] = (priorityMap[priority] || 0) + 1
  })
 
  const data = Object.keys(priorityMap).map((key) => ({
    name: key,
    value: priorityMap[key],
  }))
 
  return {
    metric: 'M2',
    data,
  }
}
// =========================
// M4: Category Distribution
// =========================
private async getCategoryDistribution() {
  const incidents = await this.serviceNowService.fetchTable(
    'incident',
    'active=true^categoryISNOTEMPTY',
  )
 
  const categoryMap: Record<string, number> = {}
 
  incidents.forEach((inc: any) => {
    const category = inc.category || 'Unknown'
    categoryMap[category] = (categoryMap[category] || 0) + 1
  })
 
  const data = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }))
 
  return {
    metric: 'M4',
    data,
  }
}
}