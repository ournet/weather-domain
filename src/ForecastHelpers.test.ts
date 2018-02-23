
import test from 'ava'
import { ForecastHelpers } from './ForecastHelpers'

test('#iconName', t => {
    for (let i = 1; i <= 15; i++) {
        const name = ForecastHelpers.iconName(i)
        t.is(typeof name, 'string', `icon ${i} is a string`)
    }

    t.not(ForecastHelpers.iconName(1, 'en'), ForecastHelpers.iconName(1, 'ro'))
})
