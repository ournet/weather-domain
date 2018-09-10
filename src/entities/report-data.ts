import { ForecastUnits } from './common';

export interface ReportData {
    id: string,
    createdAt: string,
    expiresAt: number,
    units: ForecastUnits,
    data: string,
}
