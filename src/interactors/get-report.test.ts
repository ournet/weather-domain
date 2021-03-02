import test from "ava";
import { GetReport } from "./get-report";
import { ReportRepository } from "./report-repository";
import { ReportData, TimezoneGeoPoint } from "../entities";
import { MetnoFetchForecast } from "./metno-fetch-forecast";

test("using buffer promise", async (t) => {
  const repo = new MockReportRepository();
  const getReport = new GetReport(repo, repo, new MetnoFetchForecast());

  const params1: TimezoneGeoPoint = {
    latitude: 1.1,
    longitude: 2.2,
    timezone: "Europe/Chisinau"
  };

  const params2: TimezoneGeoPoint = {
    latitude: 1.1,
    longitude: 2.2,
    timezone: "Europe/Bucharest"
  };

  const p1 = getReport.execute(params1);
  const p2 = getReport.execute(params2);

  const [result1, result2] = await Promise.all([p1, p2]);

  t.true(
    params1.timezone === result1.timezone,
    "Timezones get timezone from params"
  );
  t.true(
    result1.timezone === result2.timezone,
    "Timezones must be from params1"
  );
});

test("destroy buffer promise", async (t) => {
  const repo = new MockReportRepository();
  const getReport = new GetReport(repo, repo, new MetnoFetchForecast());
  const params: TimezoneGeoPoint = {
    latitude: 1.1,
    longitude: 2.2,
    timezone: "Europe/Chisinau"
  };

  const TIMEOUT = 3000;

  const time0 = Date.now();
  await getReport.execute(params);
  const time1 = Date.now() - time0;
  await getReport.execute(params);
  const time2 = Date.now() - time1 - time0;

  t.log(`time 1=${time1}`);
  t.true(time1 < TIMEOUT);
  t.log(`time 2=${time2}`);
  t.true(time2 < TIMEOUT);
});

class MockReportRepository implements ReportRepository {
  deleteStorage(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  createStorage(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getById(_id: string): Promise<ReportData | null> {
    return null;
  }
  getByIds(): Promise<ReportData[]> {
    throw new Error("Method not implemented.");
  }
  exists(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async put(data: ReportData): Promise<ReportData> {
    return data;
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
