import { PrecipTypeEnum, HoursDataPoint, BaseDataPoint, HourlyDataPoint, DailyDataPoint, DataPoint } from './DataPoint';
import { GeoPoint, ForecastTimePeriod, ForecastUnits, DateTime } from './common';
import { DailyDataBlock } from './DataBlock';
import { ForecastIcon } from './icon';
import { DetailsSegment, DailySegment, ForecastReportID } from './Report';

const SunCalc = require('suncalc');

export class ForecastHelpers {

    static normalizeReportId(id: ForecastReportID): ForecastReportID {
        return {
            latitude: parseFloat(id.latitude.toFixed(1)),
            longitude: parseFloat(id.longitude.toFixed(1)),
        }
    }

    static stringReportId(id: ForecastReportID): string {
        id = ForecastHelpers.normalizeReportId(id);
        return `${id.latitude.toFixed(1)}_${id.longitude.toFixed(1)}`;
    }

    static dailyReport(detailsReport: DetailsSegment): DailySegment {

        const report: DailySegment = {
            longitude: detailsReport.longitude,
            latitude: detailsReport.latitude,
            timezone: detailsReport.timezone,
            units: detailsReport.units,
            data: ForecastHelpers.dailyDataBlock(detailsReport.data.data, detailsReport),
        };

        return report;
    }

    static dailyDataBlock(data: HourlyDataPoint[], geoPoint: GeoPoint): DailyDataBlock {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }

        const dailyDataBlock: DailyDataBlock = {
            period: ForecastTimePeriod.DAILY,
            icon: ForecastHelpers.mostPopularIcon(data),
            data: null
        };

        let currentData: HoursDataPoint[] = [];
        const dataByDays = data.reduce<DailyDataPoint[]>((result, current) => {
            if (currentData.length && currentData[currentData.length - 1].time.day !== current.time.day) {
                result.push(ForecastHelpers.dailyDataPoint(currentData, geoPoint));
                currentData = [];
            } else {
                currentData.push(current);
            }

            return result;
        }, []);

        dailyDataBlock.data = dataByDays;

        return dailyDataBlock;
    }

    static dailyDataPoint(data: HourlyDataPoint[], geoPoint: GeoPoint): DailyDataPoint {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }
        const dayDataPoint = <DailyDataPoint>ForecastHelpers.hoursDataPoint(data);

        const date = dayDataPoint.time.toJSDate();

        const sun = ForecastHelpers.getSun(date, geoPoint);
        const moon = ForecastHelpers.getMoon(date);

        dayDataPoint.sunriseTime = DateTime.fromJSDate(sun.sunrise, { zone: dayDataPoint.time.zoneName });
        dayDataPoint.sunsetTime = DateTime.fromJSDate(sun.sunset, { zone: dayDataPoint.time.zoneName });
        dayDataPoint.moonPhase = moon.phase;

        return dayDataPoint;
    }

    static getSun(date: Date, geoPoint: GeoPoint): { sunrise: Date, sunset: Date } {
        const times = SunCalc.getTimes(date, geoPoint.latitude, geoPoint.longitude);

        return { sunrise: times.sunrise, sunset: times.sunset };
    }

    static getMoon(date: Date): { fraction: number, phase: number } {
        const moon = SunCalc.getMoonIllumination(date);

        return {
            fraction: moon.fraction,
            phase: moon.phase
        };
    }

    static hoursDataPoint(data: BaseDataPoint[]): HoursDataPoint {
        if (!data || !data.length) {
            throw new Error(`'data' must be un not empty array`);
        }
        const firstData = data[0];
        // const lastData = data[data.length - 1];
        const middleData = data[Math.round(data.length / 2)];

        let cloudCover = 0;
        let humidity = 0;
        let ozone = 0;
        let precipAccumulation = 0;
        let precipProbability = 0;
        let precipType: PrecipTypeEnum;
        let pressure = 0;
        let uvIndex = 0;
        let uvIndexMax = 0;
        let uvIndexTime: DateTime;
        let visibility = 0;
        let windGust = 0;
        let windSpeed = 0;
        let hours = 0;
        let dewPoint = 0;
        let temperature = 0;

        const tempData: { high: number, highTime: DateTime, low: number, lowTime: DateTime }
            = data.reduce((prev, current) => {
                const high = (<HoursDataPoint>current).temperatureHigh;
                // has interval high
                if (high) {
                    if (high > prev.high) {
                        prev.high = high;
                        prev.highTime = (<HoursDataPoint>current).temperatureHighTime;
                    }
                } else {
                    if (current.temperature > prev.high) {
                        prev.high = current.temperature;
                        prev.highTime = current.time;
                    }
                }
                const low = (<HoursDataPoint>current).temperatureLow;
                // has interval low
                if (low) {
                    if (low > prev.low) {
                        prev.low = low;
                        prev.lowTime = (<HoursDataPoint>current).temperatureLowTime;
                    }
                } else {
                    if (current.temperature < prev.low) {
                        prev.low = current.temperature;
                        prev.lowTime = current.time;
                    }
                }
                return prev;
            }, { high: 0, highTime: null, low: 100, lowTime: null });

        data.forEach(item => {
            cloudCover += (item.cloudCover || 0);
            dewPoint += (item.dewPoint || 0);
            humidity += (item.humidity || 0);
            ozone += (item.ozone || 0);
            precipAccumulation += (item.precipAccumulation || 0);
            precipProbability = precipProbability > item.precipProbability ?
                precipProbability : item.precipProbability;
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
            temperature += (item.temperature || 0);
            uvIndex += (item.uvIndex || 0);
            if (uvIndexMax < item.uvIndex) {
                uvIndexMax = item.uvIndex;
                uvIndexTime = item.time;
            }
            visibility += (item.visibility || 0);
            windGust += (item.windGust || 0);
            windSpeed += (item.windSpeed || 0);
            if ((<HoursDataPoint>item).hours) {
                hours += ((<HoursDataPoint>item).hours || 1);
            } else {
                hours++;
            }
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
            time: firstData.time,
            icon: ForecastHelpers.mostPopularIcon(data),
            temperature: temperature,
            temperatureHigh: tempData.high, // highTempData.temperature,
            temperatureHighTime: tempData.highTime, // highTempData.time,
            temperatureLow: tempData.low, // lowTempData.temperature,
            temperatureLowTime: tempData.lowTime, // lowTempData.time,
            cloudCover: cloudCover,
            dewPoint: dewPoint,
            hours: hours,
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
            windBearing: middleData.windBearing,
            windGust: windGust,
            windSpeed: windSpeed,

        };

        return ForecastHelpers.normalizeDataPoint(dataPoint);
    }

    static normalizeDataPoint(point: DataPoint): DataPoint {
        const data: DataPoint = { ...point };

        for (let prop in data) {
            if (~[null, undefined].indexOf((<any>data)[prop])) {
                delete (<any>data)[prop];
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
        if (data.windBearing) {
            data.windBearing = parseFloat(data.windBearing.toFixed(1));
        }
        if (data.windGust) {
            data.windGust = parseFloat(data.windGust.toFixed(1));
        }
        if (data.windSpeed) {
            data.windSpeed = parseInt(data.windGust.toString());
        }


        return data;
    }

    static mostPopularIcon(data: BaseDataPoint[]): ForecastIcon {
        if (!data.length) {
            throw new Error(`'data' must be a not empty array`);
        }
        const popularity: { [index: string]: number } = {};
        let mostPopularIcon: ForecastIcon = data[Math.round(data.length / 2)].icon;
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
}
