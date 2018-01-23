
import { DataPoint, DailyDataPoint, HourlyDataPoint, HoursDataPoint } from './DataPoint';
import { ForecastIcon } from './icon';

export type DataBlock = DailyDataBlock | HourlyDataBlock | HoursDataBlock;

export interface BaseDataBlock {
    icon: ForecastIcon
    night?: boolean
    // summary?: string
    data: DataPoint[]
}

export interface HoursDataBlock extends BaseDataBlock {
    data: HoursDataPoint[]
}

export interface DailyDataBlock extends BaseDataBlock {
    data: DailyDataPoint[]
}

export interface HourlyDataBlock extends BaseDataBlock {
    data: HourlyDataPoint[]
}
