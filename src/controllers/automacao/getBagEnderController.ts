import { getBagEnder } from "../../services/automacao/getBagEnder";

export async function getBagEnderController () {
    const response = await getBagEnder();
    return response;
}