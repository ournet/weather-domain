import { EntityHelpers } from "./entities/EntityHelpers";
import { ForecastReportID, ReportType } from "./entities/Report";
import { GeoPoint, ForecastIcon, ForecastUnits } from "./entities";
import { BaseDataPoint } from "./entities/DataPoint";




export class ForecastHelpers {

    static normalizeReportId(id: ForecastReportID): ForecastReportID {
        return EntityHelpers.normalizeReportId(id);
    }

    static hourlyStringReportId(id: ForecastReportID) {
        return EntityHelpers.stringReportId(id, ReportType.Hourly);
    }

    static detailsStringReportId(id: ForecastReportID) {
        return EntityHelpers.stringReportId(id, ReportType.Details);
    }

    static getSun(date: Date, geoPoint: GeoPoint): { sunrise: number, sunset: number } {
        return EntityHelpers.getSun(date, geoPoint);
    }

    static toTimeZoneDate(date: Date, timezone: string): Date {
        return EntityHelpers.toTimeZoneDate(date, timezone);
    }

    static getMoon(date: Date): { fraction: number, phase: number } {
        return EntityHelpers.getMoon(date);
    }

    static mostPopularIcon(data: BaseDataPoint[]): ForecastIcon {
        return EntityHelpers.mostPopularIcon(data);
    }

    static convertDataPointUnits<T extends BaseDataPoint>(data: T, currentUnits: ForecastUnits, newUnits: ForecastUnits): T {
        return EntityHelpers.convertDataPointUnits<T>(data, currentUnits, newUnits);
    }

    static isNight(date: Date, geoPoint: GeoPoint) {
        return EntityHelpers.isNight(date.getTime() / 1000, EntityHelpers.getSun(date, geoPoint));
    }
}
