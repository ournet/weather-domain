
import { Repository } from '@ournet/domain';
import { ReportData } from '../entities/report-data';

export interface ReportRepository extends Repository<ReportData>  {
    put(data: ReportData): Promise<ReportData>
}

export interface DetailsReportRepository extends ReportRepository { }

export interface HourlyReportRepository extends ReportRepository { }
