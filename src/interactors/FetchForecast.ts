
// const debug = require('debug')('ournet-weather');

import { UseCase } from '@ournet/domain';
import { HourlyReport, DetailsReport, DailyReport } from '../entities';

export interface FetchForecastParams {
    latitude: number
    longitude: number
}

/**
 * Fetch forecast reports
 */
export abstract class FetchForecast<PARAMS extends FetchForecastParams> extends UseCase<PARAMS, FetchForecastResult, void> {
    constructor() {
        super();
    }
}

export interface FetchForecastResult {
    hourly: HourlyReport
    details: DetailsReport
    daily: DailyReport
}
