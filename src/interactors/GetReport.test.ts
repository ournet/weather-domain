
import test from 'ava'
import { GetReport } from './GetReport'
import { IReportRepository } from './ReportRepository'
import { ReportData, TimezoneGeoPoint } from '../entities'


test('using buffer promise', async t => {
    const repo = new ReportRepository()
    const getReport = new GetReport(repo, repo, null)

    const params1: TimezoneGeoPoint = {
        latitude: 1.1,
        longitude: 2.2,
        timezone: 'Europe/Chisinau',
    }

    const params2: TimezoneGeoPoint = {
        latitude: 1.1,
        longitude: 2.2,
        timezone: 'Europe/Bucharest',
    }

    const p1 = getReport.execute(params1)
    const p2 = getReport.execute(params2)

    const [result1, result2] = await Promise.all([p1, p2])

    t.true(params1.timezone === result1.timezone, 'Timezones get timezone from params')
    t.true(result1.timezone === result2.timezone, 'Timezones must be from params1')
})

test('destroy buffer promise', async t => {
    const repo = new ReportRepository()
    const getReport = new GetReport(repo, repo, null)
    const params: TimezoneGeoPoint = {
        latitude: 1.1,
        longitude: 2.2,
        timezone: 'Europe/Chisinau',
    }

    const TIMEOUT = 3000

    const time0 = Date.now()
    await getReport.execute(params)
    const time1 = Date.now() - time0
    await getReport.execute(params)
    const time2 = Date.now() - time1

    t.true(time1 >= TIMEOUT)
    t.true(time2 >= TIMEOUT)
})

class ReportRepository implements IReportRepository {
    getById(id: string): Promise<ReportData> {
        const data: ReportData = {
            id: id,
            data: null,
            createdAt: new Date,
            expiresAt: new Date(Date.now() + 1000 * 60),
        }
        return new Promise(resolve => {
            setTimeout(function () {
                resolve(data)
            }, 1000 * 3)
        })
    }
    getByIds(): Promise<ReportData[]> {
        throw new Error("Method not implemented.");
    }
    exists(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    put(): Promise<ReportData> {
        throw new Error("Method not implemented.");
    }
    delete(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    create(): Promise<ReportData> {
        throw new Error("Method not implemented.");
    }
    update(): Promise<ReportData> {
        throw new Error("Method not implemented.");
    }
}
