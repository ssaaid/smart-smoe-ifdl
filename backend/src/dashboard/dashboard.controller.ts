import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Résumé exécutif du tableau de bord' })
  getStats() {
    return this.dashboardService.getExecutiveSummary();
  }

  @Get('kpi-summary')
  @ApiOperation({ summary: 'Résumé des KPIs pour le tableau de bord' })
  getKpiSummary() {
    return this.dashboardService.getExecutiveSummary().then((summary) => summary.kpi);
  }
}
