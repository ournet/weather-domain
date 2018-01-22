
// const debug = require('debug')('ournet-places');

import { UseCase } from '@ournet/domain';
import { HourlyReport, DetailsReport } from '../entities';
import { DailyReport } from '../entities/Report';

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
