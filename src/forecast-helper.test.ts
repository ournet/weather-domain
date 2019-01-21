
import test from 'ava'
import { ForecastHelper } from './forecast-helper'

test('#normalizeReportId', t => {
    t.deepEqual(ForecastHelper.normalizeReportId({
        latitude: 1.26,
        longitude: 1.14,
    }), {
            latitude: 1.3,
            longitude: 1.1,
        });
})
