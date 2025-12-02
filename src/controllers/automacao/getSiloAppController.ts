import { getSiloApp } from "../../services/automacao/getSiloApp";

export async function getSiloAppController () {
    const response = await getSiloApp();
    return response;
}