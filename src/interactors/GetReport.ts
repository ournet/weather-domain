
const debug = require('debug')('weather-domain');

import { UseCase } from '@ournet/domain';
import { TimezoneGeoPoint, ForecastReport } from '../entities';
import { FetchForecast } from './FetchForecast';
import { IReportRepository } from './ReportRepository';
import { ForecastUnits } from '../entities/common';
import { promiseProps, getRandomInt } from '../utils';
import { ReportData } from '../entities/ReportData';
import { DataBlockMinifier } from '../mappers/DataBlockMinifier';
import { ReportDataMapper } from '../mappers/ReportDataMapper';
import { EntityHelpers } from '../entities/EntityHelpers';

let REPORT_BUFFER_CACHE: { [key: string]: Promise<ForecastReport> } = {}

export class GetReport extends UseCase<TimezoneGeoPoint, ForecastReport, void>{
    constructor(protected detailsRepository: IReportRepository,
        protected hourlyRepository: IReportRepository,
        protected fetcher: FetchForecast) {
        super();
    }

    protected innerExecute(params: TimezoneGeoPoint): Promise<ForecastReport> {

        const normalId = EntityHelpers.normalizeReportId(params);
        const hourlyId = EntityHelpers.hourlyStringReportId(normalId);
        const detailsId = EntityHelpers.detailsStringReportId(normalId);

        const bufferKey = hourlyId;

        const buffPromise = REPORT_BUFFER_CACHE[bufferKey]
        if (buffPromise) {
            debug(`Return report promise from memory ${bufferKey}`)
            return buffPromise
        }

        if (getRandomInt(1, 10) === 2) {
            if (Object.keys(REPORT_BUFFER_CACHE).length > 30) {
                debug('Clear all buffer cache')
                clearBufferCache()
            }
        }

        const props: { [prop: string]: Promise<ReportData> } = {
            details: this.detailsRepository.getById(detailsId),
            hourly: this.hourlyRepository.getById(hourlyId),
        }

        return REPORT_BUFFER_CACHE[bufferKey] = promiseProps(props)
            .then<ForecastReport>((results: any) => {
                const report: ForecastReport = {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    timezone: params.timezone,
                    units: ForecastUnits.SI,
                }

                const details: ReportData = results.details;
                const hourly: ReportData = results.hourly;

                if (hourly && details && details.expiresAt.getTime() > Date.now()) {
                    report.details = DataBlockMinifier.toDetails(details.data);
                    report.hourly = DataBlockMinifier.toHourly(hourly.data);
                    if (report.details) {
                        report.daily = EntityHelpers.dailyDataBlock(report.details.data, report);
                    }

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
                        report.daily = EntityHelpers.dailyDataBlock(report.details.data, report);

                        const putDetails = this.detailsRepository.put(ReportDataMapper.fromDetails(newReport.details, report));
                        const putHourly = this.hourlyRepository.put(ReportDataMapper.fromHourly(newReport.hourly, report));

                        return Promise.all([putDetails, putHourly]).then(() => null);
                    })
                    .then<ForecastReport>(() => report);
            })
            .then(report => {
                clearBufferCache(bufferKey)
                return report
            })
            .catch(error => {
                clearBufferCache(bufferKey)
                throw error
            })
    }
}

function clearBufferCache(key?: string) {
    if (key) {
        delete REPORT_BUFFER_CACHE[key]
    } else {
        REPORT_BUFFER_CACHE = {}
    }
}
