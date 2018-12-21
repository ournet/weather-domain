
// const debug = require('debug')('weather-domain');

import { TimezoneGeoPoint } from "../entities/common";
import { HourlyDataPoint, HoursDataPoint, PrecipTypeEnum } from "../entities/data-point";
import { ForecastIcon } from "../entities/icon";
import { ReportHelper } from "../entities/report-helper";
import { HourlyDataBlock } from "../entities/data-block";


export class MetnoDataMapper {
    static toHourlyDataBlock(input: any[], params: TimezoneGeoPoint, hours?: number): HourlyDataBlock {

        const list: HourlyDataPoint[] = [];
        let sun: { sunrise: number, sunset: number } = { sunrise: 1, sunset: 1 };

        hours = hours || 300;

        for (let i = 0; i < hours && i < input.length; i++) {
            if (!input[i].symbol) {
                continue;
            }
            if (i === 0 ||
                ReportHelper.unixTimeToZoneDate(list[list.length - 1].time, params.timezone).getDate()
                !== ReportHelper.unixTimeToZoneDate(input[i].time, params.timezone).getDate()) {
                sun = ReportHelper.getSun(new Date(input[i].time * 1000), params);
            }
            const item = MetnoDataMapper.parseHourlyDataPoint(input[i], sun);
            list.push(item);
        }

        const dataBlock: HourlyDataBlock = {
            data: list,
            icon: ReportHelper.mostPopularIcon(list),
        };

        return dataBlock;
    }

    static parseHourlyDataPoint(item: any, sun: { sunrise: number, sunset: number }): HourlyDataPoint {

        const night = ReportHelper.isNight(item.time, sun);

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
            windDir: item.windDirection && item.windDirection.name,
            windGust: item.windGust && item.windGust.mps,
            windSpeed: item.windSpeed && item.windSpeed.mps,
            temperatureHigh: item.maxTemperature && item.maxTemperature.value,
            temperatureLow: item.minTemperature && item.minTemperature.value,
        };

        return ReportHelper.normalizeDataPoint(data);
    }

    static toIcon(symbolNumber: number): ForecastIcon {
        return symbolNumber;
    }

    static precipType(): PrecipTypeEnum | undefined {
        return undefined;
    }
}
