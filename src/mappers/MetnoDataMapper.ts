
// const debug = require('debug')('weather-domain');

import { TimezoneGeoPoint } from "../entities/common";
import { HourlyDataPoint, HoursDataPoint, PrecipTypeEnum } from "../entities/DataPoint";
import { ForecastIcon } from "../entities/icon";
import { EntityHelpers } from "../entities/EntityHelpers";
import { HourlyDataBlock } from "../entities/DataBlock";


export class MetnoDataMapper {
    static toHourlyDataBlock(input: any[], params: TimezoneGeoPoint, hours?: number): HourlyDataBlock {
        if (!input) {
            return null;
        }

        const list: HourlyDataPoint[] = [];
        let sun: { sunrise: number, sunset: number } = null;

        hours = hours || 300;

        for (let i = 0; i < hours && i < input.length; i++) {
            if (i === 0 ||
                EntityHelpers.unixTimeToZoneDate(list[list.length - 1].time, params.timezone).getDate()
                !== EntityHelpers.unixTimeToZoneDate(input[i].time, params.timezone).getDate()) {
                sun = EntityHelpers.getSun(new Date(input[i].time * 1000), params);
            }
            const item = MetnoDataMapper.parseHourlyDataPoint(input[i], sun);
            list.push(item);
        }

        const dataBlock: HourlyDataBlock = {
            data: list,
            icon: EntityHelpers.mostPopularIcon(list),
        };

        return dataBlock;
    }

    static parseHourlyDataPoint(item: any, sun: { sunrise: number, sunset: number }): HourlyDataPoint {

        const night = EntityHelpers.isNight(item.time, sun);

        const data: HoursDataPoint = {
            cloudCover: item.cloudiness && (item.cloudiness.percent / 100),
            dewPoint: item.dewpointTemperature && item.dewpointTemperature.value,
            humidity: item.humidity && (item.humidity.value / 100),
            icon: MetnoDataMapper.toIcon(item.symbol.number),
            night: night,
            precipAccumulation: item.precipitation && item.precipitation.value,
            precipType: MetnoDataMapper.precipType(),
            pressure: item.pressure && item.pressure.value,
            temperature: item.temperature && item.temperature.value,
            time: item.time,
            windBearing: item.windDirection && item.windDirection.deg,
            windGust: item.windGust && item.windGust.mps,
            windSpeed: item.windSpeed && item.windSpeed.mps,
            temperatureHigh: item.maxTemperature && item.maxTemperature.value,
            temperatureLow: item.minTemperature && item.minTemperature.value,
        };

        return EntityHelpers.normalizeDataPoint(data);
    }

    static toIcon(_symbol: number): ForecastIcon {
        return ForecastIcon.CLEAR;
    }

    static precipType(): PrecipTypeEnum {
        return null;
    }
}
