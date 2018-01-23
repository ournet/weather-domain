
const debug = require('debug')('weather-domain');

import { HourlySegment, DetailsSegment } from "../entities/Report";
import { TimezoneGeoPoint, ForecastUnits, ForecastTimePeriod, DateTime } from "../entities/common";
import { HourlyDataPoint, HoursDataPoint } from "../entities/DataPoint";
import { ForecastIcon } from "../entities/icon";
import { ForecastHelpers } from "../entities/ForecastHelpers";
import { HourlyDataBlock, HoursDataBlock } from "../entities/DataBlock";


export class MetnoDataMapper {
    static toHourlyDataBlock(input: any[], params: TimezoneGeoPoint, hours?: number): HourlyDataBlock {
        if (!input) {
            return null;
        }

        const list: HourlyDataPoint[] = [];
        let sun: { sunrise: Date, sunset: Date } = null;

        hours = hours || 300;

        for (let i = 0; i < hours && i < input.length; i++) {
            if (i === 0 || list[list.length - 1].time.day !== input[i].time.getDate()) {
                sun = ForecastHelpers.getSun(input[i].time, params);
            }
            const item = MetnoDataMapper.parseHourlyDataPoint(input[i], params, sun);
            list.push(item);
        }

        const dataBlock: HourlyDataBlock = {
            data: list,
            icon: ForecastHelpers.mostPopularIcon(list),
        };

        return dataBlock;
    }

    static parseHourlyDataPoint(item: any, params: TimezoneGeoPoint, sun: { sunrise: Date, sunset: Date }): HourlyDataPoint {
        const time = DateTime.fromJSDate(item.time, { zone: params.timezone });

        const night = ForecastHelpers.isNight(item.time, sun);

        const data: HoursDataPoint = {
            cloudCover: item.cloudiness && (item.cloudiness.percent / 100),
            dewPoint: item.dewpointTemperature && item.dewpointTemperature.value,
            humidity: item.humidity && (item.humidity.value / 100),
            icon: MetnoDataMapper.toIcon(item.symbol.number),
            night: night,
            precipAccumulation: item.precipitation && item.precipitation.value,
            precipType: null,
            pressure: item.pressure && item.pressure.value,
            temperature: item.temperature && item.temperature.value,
            time: time,
            windBearing: item.windDirection && item.windDirection.deg,
            windGust: item.windGust && item.windGust.mps,
            windSpeed: item.windSpeed && item.windSpeed.mps,
            temperatureHigh: item.maxTemperature && item.maxTemperature.value,
            temperatureLow: item.minTemperature && item.minTemperature.value,
        };

        return data;
    }

    static toIcon(_symbol: number): ForecastIcon {
        return ForecastIcon.CLEAR;
    }
}
