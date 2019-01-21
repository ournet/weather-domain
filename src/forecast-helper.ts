import { ReportHelper } from "./entities/report-helper";
import { ForecastReportID } from "./entities/report";
import { GeoPoint, ForecastIcon, ForecastUnits } from "./entities";
import { BaseDataPoint } from "./entities/data-point";



export class ForecastHelper {

    static normalizeReportId(id: ForecastReportID): ForecastReportID {
        return ReportHelper.normalizeReportId(id);
    }

    static getSun(date: Date, geoPoint: GeoPoint): { sunrise: number, sunset: number } {
        return ReportHelper.getSun(date, geoPoint);
    }

    static dateToZoneDate(date: Date, timezone: string): Date {
        return ReportHelper.dateToZoneDate(date, timezone);
    }

    static getMoon(date: Date): { fraction: number, phase: number } {
        return ReportHelper.getMoon(date);
    }

    static mostPopularIcon(data: BaseDataPoint[]): ForecastIcon {
        return ReportHelper.mostPopularIcon(data);
    }

    static convertDataPointUnits<T extends BaseDataPoint>(data: T, currentUnits: ForecastUnits, newUnits: ForecastUnits): T {
        return ReportHelper.convertDataPointUnits<T>(data, currentUnits, newUnits);
    }

    static isNight(date: Date, geoPoint: GeoPoint) {
        return ReportHelper.isNight(date.getTime() / 1000, ReportHelper.getSun(date, geoPoint));
    }
}
