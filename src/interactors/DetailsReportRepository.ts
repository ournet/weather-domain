
import { IReportReadRepository, IReportWriteRepository } from './ReportRepository';

export interface IDetailsReportReadRepository extends IReportReadRepository { }

export interface IDetailsReportWriteRepository extends IReportWriteRepository { }

export interface IDetailsReportRepository extends IDetailsReportReadRepository, IDetailsReportWriteRepository { }
