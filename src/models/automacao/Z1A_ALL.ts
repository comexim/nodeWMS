import Z1A from "./Z1A";

export default class Z1A_ALL {
    listTicket: Z1A[] = [];
    labelMap: any = {};

    constructor(data?: Partial<Z1A_ALL>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    static from(data: any): Z1A_ALL {
        return new Z1A_ALL(data);
    }
}