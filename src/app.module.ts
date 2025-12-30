import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ServiceNowService } from './servicenow/servicenow.service'
import { MetricsController } from './metrics/metrics.controller'
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    MetricsController,
  ],
  providers: [
    AppService,
    ServiceNowService,
  ],
})
export class AppModule {}