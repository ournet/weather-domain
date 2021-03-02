const debug = require("debug")("weather-domain");

import { UseCase } from "@ournet/domain";
import { TimezoneGeoPoint, ForecastReport } from "../entities";
import { FetchForecast } from "./fetch-forecast";
import { ReportRepository } from "./report-repository";
import { ForecastUnits } from "../entities/common";
import { promiseProps, getRandomInt, unixTime } from "../utils";
import { ReportData } from "../entities/report-data";
import { DataBlockMinifier } from "../mappers/data-block-minifier";
import { ReportDataMapper } from "../mappers/report-data-mapper";
import { ReportHelper } from "../entities/report-helper";

let REPORT_BUFFER_CACHE: { [key: string]: Promise<ForecastReport> } = {};

export class GetReport extends UseCase<TimezoneGeoPoint, ForecastReport, void> {
  constructor(
    protected detailsRepository: ReportRepository,
    protected hourlyRepository: ReportRepository,
    protected fetcher: FetchForecast
  ) {
    super();
  }

  protected innerExecute(params: TimezoneGeoPoint): Promise<ForecastReport> {
    const normalId = ReportHelper.normalizeReportId(params);
    const hourlyId = ReportHelper.hourlyStringReportId(normalId);
    const detailsId = ReportHelper.detailsStringReportId(normalId);

    const bufferKey = hourlyId;

    const buffPromise = REPORT_BUFFER_CACHE[bufferKey];
    if (buffPromise) {
      debug(`Return report promise from memory ${bufferKey}`);
      return buffPromise;
    }

    if (getRandomInt(1, 10) === 2) {
      if (Object.keys(REPORT_BUFFER_CACHE).length > 30) {
        debug("Clear all buffer cache");
        clearBufferCache();
      }
    }

    const props: { [prop: string]: Promise<ReportData | null> } = {
      details: this.detailsRepository.getById(detailsId),
      hourly: this.hourlyRepository.getById(hourlyId)
    };

    return (REPORT_BUFFER_CACHE[bufferKey] = promiseProps(props)
      .then<ForecastReport>((results: any) => {
        const report: ForecastReport = {
          latitude: params.latitude,
          longitude: params.longitude,
          timezone: params.timezone,
          units: ForecastUnits.SI
        };

        const details: ReportData = results.details;
        const hourly: ReportData = results.hourly;

        if (hourly && details && details.expiresAt > unixTime()) {
          report.details = DataBlockMinifier.toDetails(details.data);
          report.hourly = DataBlockMinifier.toHourly(hourly.data);
          if (report.details) {
            report.daily = ReportHelper.dailyDataBlock(
              report.details.data,
              report
            );
          }

          return report;
        }

        debug("Report is old or not exists");

        return this.fetcher.execute(params).then((newReport) => {
          if (!newReport) {
            debug("NO report");
            return report;
          }
          report.details = newReport.details;
          report.hourly = newReport.hourly;
          report.daily = ReportHelper.dailyDataBlock(
            report.details.data,
            report
          );

          const putDetails = this.detailsRepository.put(
            ReportDataMapper.fromDetails(newReport.details, report)
          );
          const putHourly = this.hourlyRepository.put(
            ReportDataMapper.fromHourly(newReport.hourly, report)
          );

          return Promise.all([putDetails, putHourly]).then(() => report);
        });
      })
      .then((report) => {
        clearBufferCache(bufferKey);
        return report;
      })
      .catch((error) => {
        clearBufferCache(bufferKey);
        throw error;
      }));
  }
}

function clearBufferCache(key?: string) {
  if (key) {
    delete REPORT_BUFFER_CACHE[key];
  } else {
    REPORT_BUFFER_CACHE = {};
  }
}
