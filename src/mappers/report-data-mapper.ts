
import { BaseForecastReport } from '../entities/report';
import { ReportData } from '../entities/report-data';
import { DataBlockMinifier } from './data-block-minifier';
import { ReportHelper } from '../entities/report-helper';
import { DETAILS_REPORT_EXPIRES_IN_HOURS, HOURLY_REPORT_EXPIRES_IN_HOURS, unixTime } from '../utils';
import { HoursDataBlock, HourlyDataBlock } from '../entities/data-block';

export class ReportDataMapper {
    static fromDetails(segment: HoursDataBlock, report: BaseForecastReport): ReportData {
        const createdAt = new Date();
        return {
            expiresAt: unixTime(new Date(Date.now() + DETAILS_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000)),
            createdAt: createdAt.toISOString(),
            id: ReportHelper.detailsStringReportId(report),
            units: report.units,
            data: DataBlockMinifier.fromDetails(segment),
        }
    }

    static fromHourly(segment: HourlyDataBlock, report: BaseForecastReport): ReportData {
        const createdAt = new Date();
        return {
            expiresAt: unixTime(new Date(Date.now() + HOURLY_REPORT_EXPIRES_IN_HOURS * 60 * 60 * 1000)),
            createdAt: createdAt.toISOString(),
            id: ReportHelper.hourlyStringReportId(report),
            units: report.units,
            data: DataBlockMinifier.fromHourly(segment),
        }
    }
}
