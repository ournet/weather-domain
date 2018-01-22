
import { IReportReadRepository, IReportWriteRepository } from './ReportRepository';

export interface IHourlyReportReadRepository extends IReportReadRepository { }

export interface IHourlyReportWriteRepository extends IReportWriteRepository { }

export interface IHourlyReportRepository extends IHourlyReportReadRepository, IHourlyReportWriteRepository { }
