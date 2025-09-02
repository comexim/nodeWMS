export function generateSchemaFromDTO(dtoClass: any, required: string[] = [], examples: Record<string, any> = {}): any {
    const instance = new dtoClass();
    const properties: Record<string, any> = {};

    for (const key in instance) {
        if (instance.hasOwnProperty(key)) {
            const value = instance[key];
            const type = typeof value;

            let propertySchema: any = {};

            switch (type) {
                case 'string':
                    propertySchema = { type: 'string' };
                    break;
                case 'number':
                    propertySchema = { type: 'number' };
                    break;
                case 'boolean':
                    propertySchema = { type: 'boolean' };
                    break;
                default:
                    propertySchema = { type: 'string' };
            }

            if (examples[key]) {
                propertySchema.example = examples[key];
            }

            properties[key] = propertySchema;
        }
    }
    return {
        type: 'object',
        required: required,
        properties: properties
    }
}