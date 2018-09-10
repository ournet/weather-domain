
import test from 'ava'
import { ForecastHelper } from './forecast-helper'

test('#iconName', t => {
    for (let i = 1; i <= 15; i++) {
        const name = ForecastHelper.iconName(i)
        t.is(typeof name, 'string', `icon ${i} is a string`)
    }

    t.not(ForecastHelper.iconName(1, 'en'), ForecastHelper.iconName(1, 'ro'))
})
