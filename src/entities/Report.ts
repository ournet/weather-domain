
import { BaseDataBlock, HoursDataBlock, HourlyDataBlock, DailyDataBlock } from './DataBlock';
import { ForecastUnits } from './common';

export type ForecastReportID = {
    latitude: number
    longitude: number
}

export interface ForecastReport {
    latitude: number
    longitude: number
    units: ForecastUnits
    timezone: string

    hourly?: HourlyDataBlock
    details?: HoursDataBlock
    daily?: HoursDataBlock
}

export enum ReportSegments {
    Hourly = 'hourly',
    Details = 'details',
    Daily = 'daily',
}

export interface DailySegment extends ReportSegment<DailyDataBlock> {
}

export interface DetailsSegment extends ReportSegment<HoursDataBlock> {
}

export interface HourlySegment extends ReportSegment<HourlyDataBlock> {
}

export interface ReportSegment<T extends BaseDataBlock> {
    latitude: number
    longitude: number
    units: ForecastUnits
    timezone: string

    data: T
}
