import { HourlySegment, DetailsSegment } from "../entities/Report";
import { TimezoneGeoPoint, ForecastUnits, ForecastTimePeriod, DateTime } from "../entities/common";
import { HourlyDataPoint, HoursDataPoint } from "../entities/DataPoint";
import { ForecastIcon } from "../entities/icon";
import { ForecastHelpers } from "../entities/ForecastHelpers";


export class MetnoDataMapper {
    static toHourlySegment(input: any[], params: TimezoneGeoPoint, hours?: number): HourlySegment {
        if (!input) {
            return null;
        }

        const segment: HourlySegment = {
            latitude: params.latitude,
            longitude: params.longitude,
            timezone: params.timezone,
            units: ForecastUnits.SI,
            data: null,
        };

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

        segment.data = {
            data: list,
            icon: ForecastHelpers.mostPopularIcon(list),
            period: ForecastTimePeriod.HOURLY,
        };

        return segment;
    }

    static toDetailsFromHourlySegment(hourly: HourlySegment): DetailsSegment {
        if (!hourly) {
            return null;
        }

        const segment: DetailsSegment = {
            latitude: hourly.latitude,
            longitude: hourly.longitude,
            timezone: hourly.timezone,
            units: ForecastUnits.SI,
            data: null,
        };

        let hourlyList: HourlyDataPoint[] = []
        const detailsList: HoursDataPoint[] = [];
        let lastItem: HourlyDataPoint = null;

        hourly.data.data.forEach(item => {
            if (lastItem && ~[0, 6, 12, 18].indexOf(item.time.hour)) {
                const hoursItem = ForecastHelpers.hoursDataPoint(hourlyList);
                detailsList.push(hoursItem);
                hourlyList = [];
            }
            hourlyList.push(item);
            lastItem = item;
        });

        if (hourlyList.length) {
            const hoursItem = ForecastHelpers.hoursDataPoint(hourlyList);
            detailsList.push(hoursItem);
        }

        segment.data = {
            icon: ForecastHelpers.mostPopularIcon(detailsList),
            data: detailsList,
            night: detailsList[parseInt((detailsList.length / 2).toString())].night,
            period: ForecastTimePeriod.HOURLY,
        };

        return segment;
    }

    static parseHourlyDataPoint(item: any, params: TimezoneGeoPoint, sun: { sunrise: Date, sunset: Date }): HourlyDataPoint {
        const time = DateTime.fromJSDate(item.time, { zone: params.timezone });

        const data: HourlyDataPoint = {
            cloudCover: item.cloudiness && item.cloudiness.percent / 100,
            dewPoint: item.dewpointTemperature && item.dewpointTemperature.value,
            humidity: item.humidity && item.humidity.value / 100,
            icon: MetnoDataMapper.toIcon(item.symbol.number),
            night: item.time > sun.sunset && item.time < sun.sunrise,
            precipAccumulation: item.precipitation && item.precipitation.value,
            precipType: null,
            pressure: item.pressure && item.pressure.value,
            temperature: item.temperature && item.temperature.value,
            time: time,
            windBearing: item.windDirection && item.windDirection.deg,
            windGust: item.windGust && item.windGust.mps,
            windSpeed: item.windSpeed && item.windSpeed.mps,
        };

        return data;
    }

    static toIcon(_symbol: number): ForecastIcon {
        return ForecastIcon.CLEAR;
    }
}


