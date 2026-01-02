import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'
 
@Injectable()
export class ServiceNowService {
  private instanceUrl: string
  private username: string
  private password: string
 
  constructor(private configService: ConfigService) {
    this.instanceUrl = this.configService.get<string>('SERVICENOW_INSTANCE_URL')!
    this.username = this.configService.get<string>('SERVICENOW_USERNAME')!
    this.password = this.configService.get<string>('SERVICENOW_PASSWORD')!
  }
 
  async fetchTable(table: string, query: string) {
    const url = `${this.instanceUrl}/api/now/table/${table}`
 
    const response = await axios.get(url, {
      auth: {
        username: this.username,
        password: this.password,
      },
      params: {
        sysparm_query: query,
        sysparm_limit: 10000,
        sysparm_display_value:true,
      },
    })
 
    return response.data.result
  }
}