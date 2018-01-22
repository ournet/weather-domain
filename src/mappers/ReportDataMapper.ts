
import { DetailsSegment, HourlySegment } from '../entities/Report';
import { ReportData } from '../entities/ReportData';
import { DataBlockMinifier } from './DataBlockMinifier';
import { ForecastHelpers } from '../entities/ForecastHelpers';
import { DETAILS_REPORT_EXPIRES_IN_HOURS, HOURLY_REPORT_EXPIRES_IN_HOURS } from '../utils';

export class ReportDataMapper {
    static fromDetailsSegment(segment: DetailsSegment): ReportData {
        return {
            expiresAt: new Date(Date.now() + DETAILS_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000),
            createdAt: new Date(),
            id: ForecastHelpers.stringReportId(segment),
            units: segment.units,
            data: DataBlockMinifier.fromDetails(segment.data),
        }
    }

    static fromHourlySegment(segment: HourlySegment): ReportData {
        return {
            expiresAt: new Date(Date.now() + HOURLY_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000),
            createdAt: new Date(),
            id: ForecastHelpers.stringReportId(segment),
            units: segment.units,
            data: DataBlockMinifier.fromHourly(segment.data),
        }
    }
}
