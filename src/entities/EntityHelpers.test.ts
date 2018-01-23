
import { EntityHelpers } from './EntityHelpers';
import test from 'ava';

test('getSun', t => {
    const sun = EntityHelpers.getSun(new Date('2018-01-23T00:00:00.000+02:00'),
        { latitude: 47.01, longitude: 28.52 });

    t.is(true, !!sun);
});

test('getMoon', t => {
    const moon = EntityHelpers.getMoon(new Date());
    t.is(true, !!moon);
});
