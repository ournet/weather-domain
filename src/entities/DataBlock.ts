
import { DataPoint, DailyDataPoint, HourlyDataPoint, HoursDataPoint } from './DataPoint';
import { ForecastIcon } from './icon';
import { ForecastTimePeriod } from './common';

export type DataBlock = DailyDataBlock | HourlyDataBlock | DetailsDataBlock;

export interface BaseDataBlock {
    period: ForecastTimePeriod
    icon: ForecastIcon
    night?: boolean
    // summary?: string
    data: DataPoint[]
}

export interface DetailsDataBlock extends BaseDataBlock {
    period: ForecastTimePeriod.HOURLY
    data: HoursDataPoint[]
}

export interface DailyDataBlock extends BaseDataBlock {
    period: ForecastTimePeriod.DAILY
    data: DailyDataPoint[]
}

export interface HourlyDataBlock extends BaseDataBlock {
    period: ForecastTimePeriod.HOURLY
    data: HourlyDataPoint[]
}
