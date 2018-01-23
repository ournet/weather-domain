
import { MetnoFetchForecast } from './MetnoFetchForecast';

import test from 'ava';

const fetcher = new MetnoFetchForecast();
const point = {
    latitude: 47.01,
    longitude: 28.52,
    timezone: 'Europe/Chisinau',
};

test('valid Report', async t => {
    const result = await fetcher.execute(point);
    // console.log(result.details.data);
    t.is(!!result, true, 'result exists');
    t.is(result.hourly.data.length, 24, '24 hourly');
});