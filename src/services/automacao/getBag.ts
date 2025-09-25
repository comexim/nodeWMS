import Retorno from "../../models/automacao/Retorno";
import { getBag } from "../../utils/dbExecute";

export async function getBag2(tagbag: string) {
    try{
        const bag = await getBag(tagbag);

        bag.bagPen14 = String(bag.bagPen14),
        bag.bagPen17 = String(bag.bagPen17),
        bag.bagPva = String(bag.bagPva),
        bag.bagGrinder = String(bag.bagGrinder),
        bag.BagImpureza = String(bag.BagImpureza)
        
        for (const key in bag) {
            if ((bag as any)[key] === "" ) {
                (bag as any)[key] = null;
            }
        }

        return bag;
    } catch (error) {
        return new Retorno ({
            code: 500,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}