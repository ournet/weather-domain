import { DateTime } from 'luxon';

export { DateTime }

export enum ForecastTimePeriod {
    DAILY = 'daily',
    HOURLY = 'hourly',
}

export interface GeoPoint {
    latitude: number
    longitude: number
}

export interface TimezoneGeoPoint extends GeoPoint {
    timezone: string
}

export enum ForecastUnits {
    SI = 'si'
}
