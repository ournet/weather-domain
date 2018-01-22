import { DataPoint, HourlyDataBlock } from "../entities";
import { BaseDataBlock, DetailsDataBlock } from "../entities/DataBlock";
import { getDataPointIdByProp, DETAILS_DATA_POINT_PROPS, HOURLY_DATA_POINT_PROPS } from "../entities/DataPoint";
import { ForecastTimePeriod } from "../entities/common";
import { ForecastIcon } from "../entities/icon";


export class DataBlockMinifier {
    static toDetails(data: string): DetailsDataBlock {
        const dataBlock = decompressDataBlock<DetailsDataBlock>(data, Object.keys(DETAILS_DATA_POINT_PROPS));
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
    static fromDetails(data: DetailsDataBlock): string {
        const dataBlock = compressDataBlock(data, Object.keys(DETAILS_DATA_POINT_PROPS));
        return dataBlock;
    }
}

function decompressDataBlock<T extends BaseDataBlock>(data: string, props: string[]): T {
    const compresedObject: { [index: string]: any, period: ForecastTimePeriod, icon: ForecastIcon, data: { [index: string]: any }[] } = JSON.parse(data);

    const dataBlock: BaseDataBlock = {
        period: compresedObject.period,
        icon: compresedObject.icon,
        night: compresedObject.night,
        data: null,
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
    const obj: { [index: string]: any, period: ForecastTimePeriod, icon: ForecastIcon, data: { [index: string]: any }[] } = {
        period: data.period,
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