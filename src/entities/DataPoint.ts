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

export enum DayPeriodName {
    Morning = 'm',
    Afternoon = 'a',
    Evening = 'e',
    Night = 'n',
}

export interface HoursDataPoint extends BaseDataPoint {
    /** 1 - for a hour, 2 - for next two hours, 3 - for next 3 hours, etc. */
    // hours?: number
    // period: DayPeriodName,
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
    id: string
    type: 'date' | 'number' | 'string' | 'boolean'
    required?: boolean
    min?: number
    max?: number
    enum?: string[] | number[]
}

const BASE_DATA_POINT_PROPS: { [prop: string]: DataPointProperty } = {
    cloudCover: {
        id: 'Cc',
        type: 'number',
        min: 0,
        max: 1,
    },
    dewPoint: {
        id: 'dp',
        type: 'number',
        min: 1,
    },
    humidity: {
        id: 'H',
        type: 'number',
        min: 0,
        max: 1,
    },
    icon: {
        id: 'I',
        type: 'string',
        required: true,
        enum: Object.keys(ForecastIcon),
    },
    night: {
        id: 'nt',
        type: 'boolean',
    },
    ozone: {
        id: 'OZ',
        type: 'number',
        min: 0.1,
    },
    precipAccumulation: {
        id: 'Pa',
        type: 'number',
        min: 0.1,
    },
    precipIntensity: {
        id: 'Pi',
        type: 'number',
        min: 0.1,
    },
    precipProbability: {
        id: 'Pp',
        type: 'number',
        min: 0,
        max: 1,
    },
    precipType: {
        id: 'Pt',
        type: 'string',
        enum: Object.keys(PrecipTypeEnum),
    },
    pressure: {
        id: 'PS',
        type: 'number',
        min: 1,
    },
    // summary?: string
    temperature: {
        id: 'T',
        type: 'number',
        min: 1,
    },
    time: {
        id: 't',
        type: 'date',
        required: true,
    },
    uvIndex: {
        id: 'UV',
        type: 'number',
        min: 0,
    },
    visibility: {
        id: 'VI',
        type: 'number',
        min: 0,
    },
    windBearing: {
        id: 'Wb',
        type: 'number',
        min: 0,
    },
    windGust: {
        id: 'Wg',
        type: 'number',
    },
    windSpeed: {
        id: 'Ws',
        type: 'number',
        min: 0,
    }
}

export const HOURLY_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = { ...BASE_DATA_POINT_PROPS };

export const DETAILS_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = {
        ...BASE_DATA_POINT_PROPS,

        hours: {
            id: 'hs',
            type: 'number',
            min: 1,
            max: 24,
        },

        apparentTemperature: {
            id: 'aT',
            type: 'number',
            min: 1,
        },
        apparentTemperatureHigh: {
            id: 'aTh',
            type: 'number',
            min: 1,
        },
        apparentTemperatureHighTime: {
            id: 'aTht',
            type: 'date',
        },
        apparentTemperatureLow: {
            id: 'aTl',
            type: 'number',
            min: 1,
        },
        apparentTemperatureLowTime: {
            id: 'aTlt',
            type: 'date',
        },

        precipIntensityMax: {
            id: 'Pim',
            type: 'number',
            min: 1,
        },
        precipIntensityMaxTime: {
            id: 'Pimt',
            type: 'date',
        },

        temperatureHigh: {
            id: 'Th',
            type: 'number',
            min: 1,
        },
        temperatureHighTime: {
            id: 'Tht',
            type: 'date',
        },
        temperatureLow: {
            id: 'Tl',
            type: 'number',
            min: 1,
        },
        temperatureLowTime: {
            id: 'Tlt',
            type: 'date',
        },

        uvIndexTime: {
            id: 'UVt',
            type: 'date',
        },
    };

export const DAILY_DATA_POINT_PROPS: { [prop: string]: DataPointProperty }
    = {
        ...BASE_DATA_POINT_PROPS,

        moonPhase: {
            id: 'MNp',
            type: 'number',
            min: 0,
            max: 1,
        },

        sunriseTime: {
            id: 'SRt',
            type: 'date',
            required: true,
        },
        sunsetTime: {
            id: 'SSt',
            type: 'date',
            required: true,
        }
    };

export function getDataPointIdByProp(prop: string): string {
    const property = HOURLY_DATA_POINT_PROPS[prop]
        || HOURLY_DATA_POINT_PROPS[prop]
        || DAILY_DATA_POINT_PROPS[prop];

    if (!property) {
        throw new Error(`Property '${prop}' doesn't exists!`);
    }

    return property.id;
}

export function getDataPointPropById(id: string): string {
    return DATA_POINT_IDS[id];
}

const DATA_POINT_IDS: { [id: string]: string } = {}

buildDataPointIds(HOURLY_DATA_POINT_PROPS);
buildDataPointIds(DETAILS_DATA_POINT_PROPS);
buildDataPointIds(DAILY_DATA_POINT_PROPS);

function buildDataPointIds(source: { [prop: string]: DataPointProperty }) {
    Object.keys(source).forEach(prop => {
        const id = source[prop].id;
        if (DATA_POINT_IDS[id] && DATA_POINT_IDS[id] !== prop) {
            throw new Error(`An id '${id}' already exists for property '${prop}'`);
        }
        DATA_POINT_IDS[id] = prop;
    });
}