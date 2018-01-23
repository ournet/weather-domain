
import { DetailsSegment, HourlySegment, BaseForecastReport } from '../entities/Report';
import { ReportData } from '../entities/ReportData';
import { DataBlockMinifier } from './DataBlockMinifier';
import { ForecastHelpers } from '../entities/ForecastHelpers';
import { DETAILS_REPORT_EXPIRES_IN_HOURS, HOURLY_REPORT_EXPIRES_IN_HOURS } from '../utils';
import { HoursDataBlock, HourlyDataBlock } from '../entities/DataBlock';
import { GeoPoint } from '../entities/common';

export class ReportDataMapper {
    static fromDetails(segment: HoursDataBlock, report: BaseForecastReport): ReportData {
        return {
            expiresAt: new Date(Date.now() + DETAILS_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000),
            createdAt: new Date(),
            id: ForecastHelpers.detailsStringReportId(report),
            units: report.units,
            data: DataBlockMinifier.fromDetails(segment),
        }
    }

    static fromHourly(segment: HourlyDataBlock, report: BaseForecastReport): ReportData {
        return {
            expiresAt: new Date(Date.now() + HOURLY_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000),
            createdAt: new Date(),
            id: ForecastHelpers.hourlyStringReportId(report),
            units: report.units,
            data: DataBlockMinifier.fromHourly(segment),
        }
    }
}
