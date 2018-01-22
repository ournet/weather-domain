
import { BaseDataBlock, HoursDataBlock, HourlyDataBlock, DailyDataBlock } from './DataBlock';
import { ForecastUnits } from './common';

export type ForecastReportID = {
    latitude: number
    longitude: number
}

export interface DailyReport extends ForecastReport<DailyDataBlock> {
}

export interface DetailsReport extends ForecastReport<HoursDataBlock> {
}

export interface HourlyReport extends ForecastReport<HourlyDataBlock> {
}

export interface ForecastReport<T extends BaseDataBlock> {
    latitude: number
    longitude: number
    units: ForecastUnits
    timezone: string

    data: T
}
