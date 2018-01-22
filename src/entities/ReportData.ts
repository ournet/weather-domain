import { ForecastUnits } from './common';

export interface ReportData {
    id: string,
    createdAt?: Date,
    expiresAt?: Date,
    units?: ForecastUnits,
    data: string,
}
