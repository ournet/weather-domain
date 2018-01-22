
export const DETAILS_REPORT_EXPIRES_IN_HOURS = 12;
export const HOURLY_REPORT_EXPIRES_IN_HOURS = 12;

export function promiseProps(props: { [prop: string]: Promise<any> }): { [prop: string]: any } {
    const keys = Object.keys(props);
    const values = keys.map(key => props[key]);

    return Promise.all(values)
        .then(result => keys.reduce<{ [key: string]: any }>((data, key, index) => {
            data[key] = result[index];
            return data;
        }, {}));
}
