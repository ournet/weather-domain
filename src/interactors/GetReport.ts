
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
        const id = ForecastHelpers.stringReportId(normalId);

        const props: { [prop: string]: Promise<ReportData> } = {
            details: this.detailsRepository.getById(id),
            hourly: this.hourlyRepository.getById(id),
        };

        return promiseProps(props).then((results: any) => {
            const details: ReportData = results.details;
            const hourly: ReportData = results.hourly;
            if (details && !hourly) {
                throw new Error(`Fatal: Details report exists and Hourly not!`)
            }
            if (!details && hourly) {
                throw new Error(`Fatal: Hourly report exists and Details not!`)
            }
            if (details && details.expiresAt.getTime() > Date.now()) {
                report.details = DataBlockMinifier.toDetails(details.data);
                report.hourly = DataBlockMinifier.toDetails(hourly.data);

                return report;
            }

            debug('Report is old or not exists');

            return this.fetcher.execute(params)
                .then(newReport => {
                    if (!newReport) {
                        debug('NO report');
                        return report;
                    }
                    report.details = newReport.details.data;
                    report.hourly = newReport.hourly.data;

                    const putDetails = this.detailsRepository.put(ReportDataMapper.fromDetailsSegment(newReport.details));
                    const putHourly = this.hourlyRepository.put(ReportDataMapper.fromHourlySegment(newReport.hourly));

                    return Promise.all([putDetails, putHourly]).then(() => null);
                })
                .then(() => report);
        });
    }
}
