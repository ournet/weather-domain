
import { JoiEntityValidator } from "@ournet/domain";
import Joi = require('joi');
import { ReportData } from "./report-data";

export class ReportDataValidator extends JoiEntityValidator<ReportData> {
    constructor() {
        super({ createSchema, updateSchema });
    }
}

const schema = {
    id: Joi.string().regex(/^(DTL|HLY)_$\d+.\d_$\d+.\d$/),

    data: Joi.string().min(50).max(8000),
    units: Joi.string().valid('SI'),

    createdAt: Joi.string().isoDate(),
    expiresAt: Joi.date().timestamp().raw(),
};

const createSchema = Joi.object().keys({
    id: schema.id.required(),

    data: schema.data.required(),
    units: schema.units.required(),

    createdAt: schema.createdAt.required(),
    expiresAt: schema.expiresAt.required(),
}).required();

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        data: schema.data,
        units: schema.units,
        expiresAt: schema.expiresAt,
    }).required(),
}).required();
