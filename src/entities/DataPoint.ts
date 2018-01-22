import { ForecastIcon } from './icon';
import { DateTime } from './common';

export type DataPoint = DailyDataPoint | HourlyDataPoint | HoursDataPoint;

export interface BaseDataPoint {
    cloudCover?: number
    dewPoint?: number
    humidity?: number
    icon: ForecastIcon
    night?: boolean
    ozone?: number
    precipAccumulation?: number
    precipIntensity?: number
    precipProbability?: number
    precipType?: PrecipTypeEnum
    pressure?: number
    // summary?: string
    temperature: number
    time: DateTime
    uvIndex?: number
    visibility?: number
    windBearing?: number
    windGust?: number
    windSpeed?: number
}

export interface HourlyDataPoint extends BaseDataPoint {

}

export interface HoursDataPoint extends BaseDataPoint {
    /** 1 - for a hour, 2 - for next two hours, 3 - for next 3 hours, etc. */
    hours?: number

    apparentTemperature?: number
    apparentTemperatureHigh?: number
    apparentTemperatureHighTime?: DateTime
    apparentTemperatureLow?: number
    apparentTemperatureLowTime?: DateTime

    precipIntensityMax?: number
    precipIntensityMaxTime?: DateTime

    temperatureHigh?: number
    temperatureHighTime?: DateTime
    temperatureLow?: number
    temperatureLowTime?: DateTime

    uvIndexTime?: DateTime
}

export interface DailyDataPoint extends HoursDataPoint {
    moonPhase?: number

    sunriseTime?: DateTime
    sunsetTime?: DateTime
}

export enum PrecipTypeEnum {
    RAIN = 'rain',
    SNOW = 'snow',
    SLEET = 'sleet',
}

export interface DataPointProperty {
    type: 'date' | 'number' | 'string' | 'boolean'
    required?: boolean
    min?: number
    max?: number
    enum?: string[] | number[]
}

const BASE_DATA_POINT_PROPS: { [prop: string]: DataPointProperty } = {
    cloudCover: {
        type: 'number',
        min: 0,
        max: 1,
    },
    dewPoint: {
        type: 'number',
        min: 1,
    },
    humidity: {
        type: 'number',
        min: 0,
        max: 1,
    },
    icon: {
        type: 'string',
        required: true,
        enum: Object.keys(ForecastIcon),
    },
    night: {
        type: 'boolean',
    },
    ozone: {
        type: 'number',
        min: 0.1,
    },
    precipAccumulation: {
        type: 'number',
        min: 0.1,
    },
    precipIntensity: {
        type: 'number',
        min: 0.1,
    },
    precipProbability: {
        type: 'number',
        min: 0,
        max: 1,
    },
    precipType: {
        type: 'string',
        enum: Object.keys(PrecipTypeEnum),
    },
    pressure: {
        type: 'number',
        min: 1,
    },
    // summary?: string
    temperature: {
        type: 'number',
        min: 1,
    },
    time: {
        type: 'date',
        required: true,
    },
    uvIndex: {
        type: 'number',
        min: 0,
    },
    visibility: {
        type: 'number',
        min: 0,
    },
    windBearing: {
        type: 'number',
        min: 0,
    },
    windGust: {
        type: 'number',
    },
    windSpeed: {
        type: 'number',
        min: 0,
    }
}

export const HOURLY_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = { ...BASE_DATA_POINT_PROPS };

export const HOURS_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = {
        ...BASE_DATA_POINT_PROPS,

        hours: {
            type: 'number',
            min: 1,
            max: 24,
        },

        apparentTemperature: {
            type: 'number',
            min: 1,
        },
        apparentTemperatureHigh: {
            type: 'number',
            min: 1,
        },
        apparentTemperatureHighTime: {
            type: 'date',
        },
        apparentTemperatureLow: {
            type: 'number',
            min: 1,
        },
        apparentTemperatureLowTime: {
            type: 'date',
        },

        precipIntensityMax: {
            type: 'number',
            min: 1,
        },
        precipIntensityMaxTime: {
            type: 'date',
        },

        temperatureHigh: {
            type: 'number',
            min: 1,
        },
        temperatureHighTime: {
            type: 'date',
        },
        temperatureLow: {
            type: 'number',
            min: 1,
        },
        temperatureLowTime: {
            type: 'date',
        },

        uvIndexTime: {
            type: 'date',
        },
    };

export const DAILY_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = {
        ...BASE_DATA_POINT_PROPS,

        moonPhase: {
            type: 'number',
            min: 0,
            max: 1,
        },

        sunriseTime: {
            type: 'date',
            required: true,
        },
        sunsetTime: {
            type: 'date',
            required: true,
        }
    };
    