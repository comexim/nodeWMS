import { getBagPos } from "../../services/automacao/getBagPos";

export async function getBagPosController ()
{
    const response = getBagPos();
    return response;
}