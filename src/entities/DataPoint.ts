import { ForecastIcon } from './icon';

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
    time: number
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
    
    // from forecast.io:
    // apparentTemperature?: number
    // apparentTemperatureHigh?: number
    // apparentTemperatureHighTime?: number
    // apparentTemperatureLow?: number
    // apparentTemperatureLowTime?: number

    // precipIntensityMax?: number
    // precipIntensityMaxTime?: number

    temperatureHigh?: number
    temperatureHighTime?: number
    temperatureLow?: number
    temperatureLowTime?: number

    uvIndexTime?: number
}

export interface DailyDataPoint extends HoursDataPoint {
    moonPhase?: number

    sunriseTime?: number
    sunsetTime?: number
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
        min: 0.01,
    },
    precipAccumulation: {
        id: 'Pa',
        type: 'number',
        min: 0.01,
    },
    precipIntensity: {
        id: 'Pi',
        type: 'number',
        min: 0.01,
    },
    precipProbability: {
        id: 'Pp',
        type: 'number',
        min: 0.01,
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
    },
    time: {
        id: 't',
        type: 'date',
        required: true,
    },
    uvIndex: {
        id: 'UV',
        type: 'number',
        min: 0.1,
    },
    visibility: {
        id: 'VI',
        type: 'number',
        min: 0.1,
    },
    windBearing: {
        id: 'Wb',
        type: 'number',
        min: 0,
    },
    windGust: {
        id: 'Wg',
        type: 'number',
        min: 0.1,
    },
    windSpeed: {
        id: 'Ws',
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
            id: 'hs',
            type: 'number',
            min: 1,
            max: 24,
        },

        apparentTemperature: {
            id: 'aT',
            type: 'number',
        },
        apparentTemperatureHigh: {
            id: 'aTh',
            type: 'number',
        },
        apparentTemperatureHighTime: {
            id: 'aTht',
            type: 'date',
        },
        apparentTemperatureLow: {
            id: 'aTl',
            type: 'number',
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
        },
        temperatureHighTime: {
            id: 'Tht',
            type: 'date',
        },
        temperatureLow: {
            id: 'Tl',
            type: 'number',
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

export function getDataPointProperty(prop: string): DataPointProperty {
    return HOURLY_DATA_POINT_PROPS[prop]
        || HOURS_DATA_POINT_PROPS[prop]
        || DAILY_DATA_POINT_PROPS[prop];
}

export function getDataPointIdByProp(prop: string): string {
    const property = getDataPointProperty(prop);

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
buildDataPointIds(HOURS_DATA_POINT_PROPS);
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