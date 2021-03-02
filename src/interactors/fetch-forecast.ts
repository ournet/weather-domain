// const debug = require('debug')('ournet-weather');

import { UseCase } from "@ournet/domain";
import { TimezoneGeoPoint, HourlyDataBlock, HoursDataBlock } from "../entities";
import { ForecastUnits } from "../entities/common";

/**
 * Fetch forecast reports
 */
export abstract class FetchForecast extends UseCase<
  TimezoneGeoPoint,
  FetchForecastResult | null,
  void
> {
  constructor() {
    super();
  }
}

export interface FetchForecastResult {
  units: ForecastUnits;
  hourly: HourlyDataBlock;
  details: HoursDataBlock;
}
