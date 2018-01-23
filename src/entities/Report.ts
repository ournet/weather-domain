
import { HoursDataBlock, HourlyDataBlock, DailyDataBlock } from './DataBlock';
import { ForecastUnits } from './common';

export type ForecastReportID = {
    latitude: number
    longitude: number
}

export interface BaseForecastReport {
    latitude: number
    longitude: number
    units: ForecastUnits
    timezone: string
}

export interface ForecastReport extends BaseForecastReport {
    hourly?: HourlyDataBlock
    details?: HoursDataBlock
    daily?: DailyDataBlock
}

export enum ReportType {
    Hourly = 'hourly',
    Details = 'details',
    Daily = 'daily',
}
