import WMS_SeqOpDTO from "../models/WMS_SeqOpDTO";
import Z71DTO from "../models/Z71DTO";
import WMS_ApImasDTO from "../models/WMS_ApImasDTO";
import { generateSchemaFromDTO } from "./schemas";

export const Z71Schema = generateSchemaFromDTO(Z71DTO);
export const ApImasSchema = generateSchemaFromDTO(WMS_ApImasDTO)
export const SeqOpSchema = generateSchemaFromDTO(WMS_SeqOpDTO);

export const schemas = {
    Z71Schema,
    SeqOpSchema,
    ApImasSchema,
    
    TokenSchema: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string', example: 'string' },
            password: { type: 'string', example: 'string' }
        }
    }
};