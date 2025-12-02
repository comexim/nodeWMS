import { getSiloWMSSUP } from "../../services/automacao/getSiloWMSSUP";

export async function getSiloWMSSUPController () {
    const response = await getSiloWMSSUP();
    return response;
}