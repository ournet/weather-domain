
const debug = require('debug')('weather-domain');

import { UseCase } from '@ournet/domain';
import { TimezoneGeoPoint, ForecastHelpers, ForecastReport } from '../entities';
import { FetchForecast } from './FetchForecast';
import { IReportRepository } from './ReportRepository';
import { ForecastUnits } from '../entities/common';
import { promiseProps } from '../utils';
import { ReportData } from '../entities/ReportData';
import { DataBlockMinifier } from '../mappers/DataBlockMinifier';
import { ReportDataMapper } from '../mappers/ReportDataMapper';

export class GetReport extends UseCase<TimezoneGeoPoint, ForecastReport, void>{
    constructor(protected detailsRepository: IReportRepository,
        protected hourlyRepository: IReportRepository,
        protected fetcher: FetchForecast) {
        super();
    }

    protected innerExecute(params: TimezoneGeoPoint): Promise<ForecastReport> {

        const report: ForecastReport = {
            latitude: params.latitude,
            longitude: params.longitude,
            timezone: params.timezone,
            units: ForecastUnits.SI,
        }

        const normalId = ForecastHelpers.normalizeReportId(params);
        const hourlyId = ForecastHelpers.hourlyStringReportId(normalId);
        const detailsId = ForecastHelpers.detailsStringReportId(normalId);

        const props: { [prop: string]: Promise<ReportData> } = {
            details: this.detailsRepository.getById(detailsId),
            hourly: this.hourlyRepository.getById(hourlyId),
        };

        return promiseProps(props).then((results: any) => {
            const details: ReportData = results.details;
            const hourly: ReportData = results.hourly;
            
            if (hourly && details && details.expiresAt.getTime() > Date.now()) {
                report.details = DataBlockMinifier.toDetails(details.data);
                report.hourly = DataBlockMinifier.toHourly(hourly.data);

                report.daily = ForecastHelpers.dailyDataBlock(report.details.data, report);

                return report;
            }

            debug('Report is old or not exists');

            return this.fetcher.execute(params)
                .then(newReport => {
                    if (!newReport) {
                        debug('NO report');
                        return report;
                    }
                    report.details = newReport.details;
                    report.hourly = newReport.hourly;
                    report.daily = ForecastHelpers.dailyDataBlock(report.details.data, report);

                    const putDetails = this.detailsRepository.put(ReportDataMapper.fromDetails(newReport.details, report));
                    const putHourly = this.hourlyRepository.put(ReportDataMapper.fromHourly(newReport.hourly, report));

                    return Promise.all([putDetails, putHourly]).then(() => null);
                })
                .then(() => report);
        });
    }
}
