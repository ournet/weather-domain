
import { ForecastHelpers } from './ForecastHelpers';
import test from 'ava';

test('getSun', t => {
    const sun = ForecastHelpers.getSun(new Date(), { latitude: 47.01, longitude: 28.52 });
    t.is(true, !!sun);
});

test('getMoon', t => {
    const moon = ForecastHelpers.getMoon(new Date());
    t.is(true, !!moon);
});
