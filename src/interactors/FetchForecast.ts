
// const debug = require('debug')('ournet-weather');

import { UseCase } from '@ournet/domain';
import { HourlySegment, DetailsSegment, TimezoneGeoPoint } from '../entities';

/**
 * Fetch forecast reports
 */
export abstract class FetchForecast extends UseCase<TimezoneGeoPoint, FetchForecastResult, void> {
    constructor() {
        super();
    }
}

export interface FetchForecastResult {
    hourly: HourlySegment
    details: DetailsSegment
}
