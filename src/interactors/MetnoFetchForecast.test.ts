
import { MetnoFetchForecast } from './MetnoFetchForecast';

import test from 'ava';
import { ForecastHelpers } from '../entities/ForecastHelpers';

const fetcher = new MetnoFetchForecast();
const point = {
    latitude: 28.45,
    longitude: 46.4,
    timezone: 'Europe/Chisinau',
};

test('valid Report', async t => {
    const result = await fetcher.execute(point);
    console.log(result.details.data);
    t.is(!!result, true, 'result exists');
    t.is(result.hourly.data.data.length, 24, '24 hourly');
});