import { DataPoint, HourlyDataBlock } from "../entities";
import { BaseDataBlock, HoursDataBlock } from "../entities/data-block";
import { getDataPointIdByProp, HOURS_DATA_POINT_PROPS, HOURLY_DATA_POINT_PROPS } from "../entities/data-point";
import { ForecastTimePeriod } from "../entities/common";
import { ForecastIcon } from "../entities/icon";


export class DataBlockMinifier {
    static toDetails(data: string): HoursDataBlock {
        const dataBlock = decompressDataBlock<HoursDataBlock>(data, Object.keys(HOURS_DATA_POINT_PROPS));
        return dataBlock;
    }
    static toHourly(data: string): HourlyDataBlock {
        const dataBlock = decompressDataBlock<HourlyDataBlock>(data, Object.keys(HOURLY_DATA_POINT_PROPS));
        return dataBlock;
    }
    static fromHourly(data: HourlyDataBlock): string {
        const dataBlock = compressDataBlock(data, Object.keys(HOURLY_DATA_POINT_PROPS));
        return dataBlock;
    }
    static fromDetails(data: HoursDataBlock): string {
        const dataBlock = compressDataBlock(data, Object.keys(HOURS_DATA_POINT_PROPS));
        return dataBlock;
    }
}

function decompressDataBlock<T extends BaseDataBlock>(data: string, props: string[]): T {
    const compresedObject: { [index: string]: any, period: ForecastTimePeriod, icon: ForecastIcon, data: { [index: string]: any }[] } = JSON.parse(data);

    const dataBlock: BaseDataBlock = {
        icon: compresedObject.icon,
        night: compresedObject.night,
        data: [],
    };

    dataBlock.data = <DataPoint[]>compresedObject.data.map(dataPoint => {
        const result: { [index: string]: any } = {};
        props.forEach(prop => {
            const id = getDataPointIdByProp(prop);
            const value = (<any>dataPoint)[id];

            if ([undefined, null].indexOf(value) < 0) {
                result[prop] = value;
            }
        });
        return result as DataPoint;
    });

    return dataBlock as T;
}

function compressDataBlock(data: BaseDataBlock, props: string[]): string {
    const obj: { [index: string]: any, icon: ForecastIcon, data: { [index: string]: any }[] } = {
        icon: data.icon,
        data: []
    };

    if (typeof data.night === 'boolean') {
        obj.night = data.night;
    }

    obj.data = data.data.map(dataPoint => {
        const result: { [index: string]: any } = {};
        props.forEach(prop => {
            const value = (<any>dataPoint)[prop];
            const id = getDataPointIdByProp(prop);
            if ([undefined, null].indexOf(value) < 0) {
                result[id] = value;
            }
        });
        return result;
    });

    return JSON.stringify(obj);
}
