import { getProdProtheusXWMS } from "../../services/automacao/getProdProtheusXWMS";

export async function getProdProtheusXWMSController () {
    const response = await getProdProtheusXWMS();
    return response;
}