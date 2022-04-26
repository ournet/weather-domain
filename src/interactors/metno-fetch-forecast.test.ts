import { MetnoFetchForecast } from "./metno-fetch-forecast";

import test from "ava";

const fetcher = new MetnoFetchForecast("ournet/1.0");

test("valid Report", async (t) => {
  const point = {
    latitude: 47.01,
    longitude: 28.52,
    timezone: "Europe/Chisinau"
  };

  const result = await fetcher.execute(point);
  // console.log(result.details.data);
  t.is(!!result, true, "result exists");
  result && t.is(result.hourly.data.length, 24, "24 hourly");
});

test("Çorrush", async (t) => {
  const point = {
    latitude: 40.44,
    longitude: 19.80,
    timezone: "Europe/Tirane"
  };
  const result = await fetcher.execute(point);
  // console.log(JSON.stringify(result));
  t.is(!!result, true, "result exists");
  result && t.is(result.hourly.data.length, 24, "24 hourly");
});
