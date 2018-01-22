
import { IReadRepository, IWriteRepository } from '@ournet/domain';
import { ReportData } from '../entities/ReportData';

export interface IReportReadRepository extends IReadRepository<string, ReportData> { }

export interface IReportWriteRepository extends IWriteRepository<string, ReportData> {
    put(data: ReportData): Promise<ReportData>
}

export interface IReportRepository extends IReportReadRepository, IReportWriteRepository { }
