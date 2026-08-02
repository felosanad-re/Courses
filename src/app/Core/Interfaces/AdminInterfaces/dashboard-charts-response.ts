import { ChartPointResponse } from './AdminInterfaces/chart-point-response';

export interface DashboardChartsResponse {
  key: string;
  title: string;
  data: ChartPointResponse[];
}
