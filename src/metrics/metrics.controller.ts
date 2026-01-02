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
      case 'M5':
        return this.getGroupWorkload()
      case 'M7':
        return this.getSlaBreachStatus()
      case 'M9':
        return this.getStateFunnel()
      case 'M8':
        return this.getTopCallers()
      default:
        return {
          message: 'Metric not implemented',
        }
    }
  }
 
  
  // M1: Total Open Incidents
  
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
 
  
  // M6: Unassigned Tickets
  
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
 
  
  // M10: Stale Tickets (>30 days)
  
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

// M4: Category Distribution

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

// M5: Group Workload

private async getGroupWorkload() {
  const incidents = await this.serviceNowService.fetchTable(
    'incident',
    'active=true^assignment_groupISNOTEMPTY',
  )
 
  if (!Array.isArray(incidents)) {
    return { metric: 'M5', data: [] }
  }
 
  const groupMap: Record<string, number> = {}
 
  incidents.forEach((inc: any) => {
    const group = inc.assignment_group?.display_value
    if (!group) return
    groupMap[group] = (groupMap[group] || 0) + 1
  })
 
  const data = Object.keys(groupMap).map((key) => ({
    name: key,
    value: groupMap[key],
  }))
 
  return { metric: 'M5', data }
}

// M7: SLA Breach Status

private async getSlaBreachStatus() {
  const tasks = await this.serviceNowService.fetchTable(
    'task_sla',
    'stage=in_progress^has_breached=true',
  )
 
  return {
    metric: 'M7',
    data: [
      { name: 'Breached', value: tasks.length },
    ],
  }
}
 

// M9: State Funnel

private async getStateFunnel() {
  const incidents =
    (await this.serviceNowService.fetchTable(
      'incident',
      'active=true'
    )) || []   
  const stateMap: Record<string, number> = {}
 
  incidents.forEach((inc: any) => {
    const state = inc.state || 'Unknown'
    stateMap[state] = (stateMap[state] || 0) + 1
  })
 
  const data = Object.keys(stateMap).map((key) => ({
    name: key,
    value: stateMap[key],
  }))
 
  return {
    metric: 'M9',
    data,
  }
}

// M8: Top 5 Monthly Callers

private async getTopCallers() {
  const incidents = await this.serviceNowService.fetchTable(
    'incident',
    'opened_atONThis month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()',
  )
 
  const callerMap: Record<string, number> = {}
 
  incidents.forEach((inc: any) => {
    const caller =
      inc.caller_id?.display_value || 'Unknown'
    callerMap[caller] = (callerMap[caller] || 0) + 1
  })
 
  const data = Object.keys(callerMap)
    .map((key) => ({
      caller: key,
      count: callerMap[key],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
 
  return {
    metric: 'M8',
    data,
  }
}
}