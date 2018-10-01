
const debug = require('debug')('ournet:weather-domain');
import {
    PrecipTypeEnum,
    HoursDataPoint,
    BaseDataPoint,
    HourlyDataPoint,
    DailyDataPoint,
    DataPoint,
    getDataPointProperty
} from './data-point';

import { GeoPoint, ForecastUnits } from './common';
import { DailyDataBlock, HoursDataBlock } from './data-block';
import { ForecastIcon } from './icon';
import { ForecastReportID, BaseForecastReport, ReportType } from './report';
import { DateTime } from 'luxon';

const SunCalc = require('suncalc');

export class ReportHelper {

    static normalizeReportId(id: ForecastReportID): ForecastReportID {
        return {
            latitude: parseFloat(id.latitude.toFixed(1)),
            longitude: parseFloat(id.longitude.toFixed(1)),
        }
    }

    static hourlyStringReportId(id: ForecastReportID) {
        return ReportHelper.stringReportId(id, ReportType.Hourly);
    }

    static detailsStringReportId(id: ForecastReportID) {
        return ReportHelper.stringReportId(id, ReportType.Details);
    }

    static stringReportId(id: ForecastReportID, type: ReportType): string {
        let prefix = '';
        switch (type) {
            case ReportType.Hourly:
                prefix = 'HLY';
                break;
            case ReportType.Details:
                prefix = 'DTL';
                break;
            // case ReportType.Daily:
            //     prefix = 'DLY';
            //     break;
            default: throw new Error(`Invalid report type ${type}`);
        }
        id = ReportHelper.normalizeReportId(id);
        return `${prefix}_${id.latitude.toFixed(1)}_${id.longitude.toFixed(1)}`;
    }

    static dailyDataBlock(data: BaseDataPoint[], report: BaseForecastReport): DailyDataBlock {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }

        const dailyDataBlock: DailyDataBlock = {
            icon: ReportHelper.mostPopularIcon(data),
            data: ReportHelper.splitByDay(data, report.timezone).map(item => ReportHelper.dailyDataPoint(item, report)),
        };

        return dailyDataBlock;
    }

    static dailyDataPoint(data: HourlyDataPoint[], report: BaseForecastReport): DailyDataPoint {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }
        const dayDataPoint = <DailyDataPoint>ReportHelper.hoursDataPoint(data);

        delete dayDataPoint.night;

        const date = new Date(dayDataPoint.time * 1000);

        const sun = ReportHelper.getSun(date, report);
        const moon = ReportHelper.getMoon(date);

        dayDataPoint.sunriseTime = sun.sunrise;
        dayDataPoint.sunsetTime = sun.sunset;
        dayDataPoint.moonPhase = parseFloat(moon.phase.toFixed(2));

        return dayDataPoint;
    }

    static hoursDataBlock(data: HourlyDataPoint[]): HoursDataBlock {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }

        const dataBlock: HoursDataBlock = {
            icon: ReportHelper.mostPopularIcon(data),
            data: ReportHelper.splitByDayPeriod(data).map(item => ReportHelper.hoursDataPoint(item)),
        };

        return dataBlock;
    }

    static getSun(date: Date, geoPoint: GeoPoint): { sunrise: number, sunset: number } {
        const times = SunCalc.getTimes(date, geoPoint.latitude, geoPoint.longitude);

        return {
            sunrise: Math.trunc(times.sunrise.getTime() / 1000),
            sunset: Math.trunc(times.sunset.getTime() / 1000)
        };
    }

    static dateToZoneDate(date: Date, timezone: string): Date {
        return DateTime.fromJSDate(date, { zone: timezone }).toJSDate();
    }

    static unixTimeToZoneDate(time: number, timezone: string): Date {
        return DateTime.fromMillis(time * 1000, { zone: timezone }).toJSDate();
    }

    static getMoon(date: Date): { fraction: number, phase: number } {
        const moon = SunCalc.getMoonIllumination(date);

        return {
            fraction: moon.fraction,
            phase: moon.phase
        };
    }

    static hoursDataPoint(data: HourlyDataPoint[]): HoursDataPoint {
        if (!data || !data.length) {
            throw new Error(`'data' must be un not empty array`);
        }

        const firstData = data[0];
        // const lastData = data[data.length - 1];
        const middleData = data[parseInt((data.length / 2).toString())];

        let cloudCover = 0;
        let humidity = 0;
        let ozone = 0;
        let precipAccumulation = 0;
        let precipProbability = 0;
        let precipType: PrecipTypeEnum | undefined;
        let pressure = 0;
        let uvIndex = 0;
        let uvIndexMax = 0;
        let uvIndexTime: number | undefined;
        let visibility = 0;
        let windGust = 0;
        let windSpeed = 0;
        let dewPoint = 0;
        let temperature = 0;

        const tempData
            = data.reduce((prev, current) => {
                const high = (<HoursDataPoint>current).temperatureHigh;
                // has interval high
                if (high) {
                    if (prev.high === undefined || high > prev.high) {
                        prev.high = high;
                        if ((<HoursDataPoint>current).temperatureHighTime) {
                            prev.highTime = (<HoursDataPoint>current).temperatureHighTime as number;
                        }
                    }
                } else {
                    if (prev.high === undefined || current.temperature > prev.high) {
                        prev.high = current.temperature;
                        prev.highTime = current.time;
                    }
                }
                const low = (<HoursDataPoint>current).temperatureLow;
                // has interval low
                if (low) {
                    if (prev.low === undefined || low < prev.low) {
                        prev.low = low;
                        if ((<HoursDataPoint>current).temperatureLowTime) {
                            prev.lowTime = (<HoursDataPoint>current).temperatureLowTime as number;
                        }
                    }
                } else {
                    if (prev.low === undefined || current.temperature < prev.low) {
                        prev.low = current.temperature;
                        prev.lowTime = current.time;
                    }
                }
                return prev;
            }, {} as { high: number | undefined, highTime: number | undefined, low: number | undefined, lowTime: number | undefined });

        data.forEach(item => {
            cloudCover += (item.cloudCover || 0);
            dewPoint += (item.dewPoint || 0);
            humidity += (item.humidity || 0);
            ozone += (item.ozone || 0);
            precipAccumulation += (item.precipAccumulation || 0);
            if (item.precipProbability !== undefined) {
                precipProbability = precipProbability > item.precipProbability ?
                    precipProbability : item.precipProbability;
            }
            if (item.precipType) {
                // already set:
                if (precipType) {
                    if (item.precipType === 'snow') {
                        precipType = item.precipType;
                    }
                } else {
                    precipType = item.precipType;
                }
            }
            pressure += (item.pressure || 0);
            temperature += item.temperature;
            uvIndex += (item.uvIndex || 0);
            if (item.uvIndex !== undefined) {
                if (uvIndexMax < item.uvIndex) {
                    uvIndexMax = item.uvIndex;
                    uvIndexTime = item.time;
                }
            }
            visibility += (item.visibility || 0);
            windGust += (item.windGust || 0);
            windSpeed += (item.windSpeed || 0);
            // if ((<HoursDataPoint>item).hours) {
            //     hours += ((<HoursDataPoint>item).hours || 1);
            // } else {
            //     hours++;
            // }
        });

        cloudCover /= data.length;
        humidity /= data.length;
        ozone /= data.length;
        pressure /= data.length;
        uvIndex /= data.length;
        visibility /= data.length;
        windSpeed /= data.length;
        dewPoint /= data.length;
        temperature /= data.length;

        const dataPoint: HoursDataPoint = {
            // period: ForecastHelpers.getDayPeriod(firstData.time),
            time: firstData.time,
            icon: ReportHelper.mostPopularIcon(data),
            temperature: temperature,
            temperatureHigh: tempData.high, // highTempData.temperature,
            temperatureHighTime: tempData.highTime, // highTempData.time,
            temperatureLow: tempData.low, // lowTempData.temperature,
            temperatureLowTime: tempData.lowTime, // lowTempData.time,
            cloudCover: cloudCover,
            dewPoint: dewPoint,
            // hours: hours,
            humidity: humidity,
            // moonPhase ?
            ozone: ozone,
            night: middleData.night,
            precipAccumulation: precipAccumulation,
            precipProbability: precipProbability,
            precipType: precipType,
            pressure: pressure,
            // summary ?
            // sunriseTime
            // sunsetTime
            uvIndex: uvIndex,
            uvIndexTime: uvIndexTime,
            visibility: visibility,
            windDir: middleData.windDir,
            windGust: windGust,
            windSpeed: windSpeed,

        };

        return ReportHelper.normalizeDataPoint(dataPoint) as HoursDataPoint;
    }

    static normalizeDataPoint(point: DataPoint): DataPoint {
        const data: DataPoint = { ...point };

        for (let prop in data) {
            const value = (<any>data)[prop];
            if (~[null, undefined].indexOf(value)) {
                delete (<any>data)[prop];
            } else {
                const property = getDataPointProperty(prop);
                if (!property) {
                    debug('no property ', prop);
                    continue
                }
                if (property.min && value < property.min) {
                    delete (<any>data)[prop];
                }
                else if (property.max && value > property.max) {
                    delete (<any>data)[prop];
                }
            }
        }

        if (data.cloudCover) {
            data.cloudCover = parseFloat(data.cloudCover.toFixed(2));
        }
        if (data.dewPoint) {
            data.dewPoint = parseFloat(data.dewPoint.toFixed(1));
        }
        if (data.humidity) {
            data.humidity = parseFloat(data.humidity.toFixed(2));
        }
        if (data.precipAccumulation) {
            data.precipAccumulation = parseFloat(data.precipAccumulation.toFixed(1));
        }
        if (data.precipIntensity) {
            data.precipIntensity = parseFloat(data.precipIntensity.toFixed(1));
        }
        if (data.precipProbability) {
            data.precipProbability = parseFloat(data.precipProbability.toFixed(1));
        }
        if (data.pressure) {
            data.pressure = parseFloat(data.pressure.toFixed(1));
        }
        if (data.temperature) {
            data.temperature = parseFloat(data.temperature.toFixed(1));
        }
        if (data.uvIndex) {
            data.uvIndex = parseFloat(data.uvIndex.toFixed(1));
        }
        if (data.visibility) {
            data.visibility = parseFloat(data.visibility.toFixed(2));
        }
        if (data.windDir) {
            data.windDir = data.windDir;
        }
        if (data.windGust) {
            data.windGust = parseFloat(data.windGust.toFixed(1));
        }
        if (data.windSpeed) {
            data.windSpeed = parseFloat(data.windSpeed.toFixed(1));
        }

        const moonPhase = (<DailyDataPoint>data).moonPhase;

        if (moonPhase !== undefined) {
            (<DailyDataPoint>data).moonPhase = parseFloat(moonPhase.toFixed(2));
        }


        return data;
    }

    static mostPopularIcon(data: BaseDataPoint[]): ForecastIcon {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }
        const popularity: { [index: string]: number } = {};
        let mostPopularIcon: ForecastIcon = data[parseInt((data.length / 2).toString())].icon;
        let mostPopularIconCount = 1;

        data.forEach(item => {
            popularity[item.icon] = popularity[item.icon] || 0;
            popularity[item.icon]++;
            if (popularity[item.icon] > mostPopularIconCount) {
                mostPopularIconCount = popularity[item.icon];
                mostPopularIcon = item.icon;
            }
        });

        return mostPopularIcon;
    }

    static convertDataPointUnits<T extends BaseDataPoint>(data: T, currentUnits: ForecastUnits, newUnits: ForecastUnits): T {
        if (currentUnits === newUnits) {
            return data;
        }
        return data;
    }

    static splitByDay(data: BaseDataPoint[], timezone: string) {
        const list: HoursDataPoint[][] = [];
        let currentData: HoursDataPoint[] = [];

        data.forEach(item => {
            if (currentData.length &&
                ReportHelper.unixTimeToZoneDate(currentData[currentData.length - 1].time, timezone).getDate()
                !== ReportHelper.unixTimeToZoneDate(item.time, timezone).getDate()) {
                list.push(currentData);
                currentData = [];
            }
            currentData.push(item);
        });

        if (currentData.length) {
            list.push(currentData);
        }

        return list;
    }

    static splitByDayPeriod(data: HoursDataPoint[]) {
        debug(`start splitByDaySegment ${data.length}`)
        const list: HoursDataPoint[][] = [];
        let currentData: HoursDataPoint[] = [];
        data.forEach(item => {
            if (currentData.length && ~[0, 6, 12, 18].indexOf(new Date(item.time * 1000).getUTCHours())) {
                list.push(currentData);
                currentData = [];
            }
            currentData.push(item);
        });

        // debug(`splitByDaySegment currentData ${currentData.map(item => item.time.toString())}`)

        if (currentData.length && currentData.length < 7) {
            list.push(currentData);
        }

        return list;
    }

    // static getDayPeriod(time: DateTime): DayPeriodName {
    //     if ([22, 23, 0, 1, 2, 3].indexOf(time.hour)) {
    //         return DayPeriodName.Night;
    //     }
    //     if ([4, 5, 6, 7, 8, 9, 10, 11].indexOf(time.hour)) {
    //         return DayPeriodName.Morning;
    //     }
    //     if ([12, 13, 14, 15, 16].indexOf(time.hour)) {
    //         return DayPeriodName.Afternoon;
    //     }

    //     return DayPeriodName.Evening;
    // }

    static isNight(time: number, sun: { sunrise: number, sunset: number }) {
        return !(time > sun.sunrise && time < sun.sunset);
    }
}
