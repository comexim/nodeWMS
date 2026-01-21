import Retorno from "../../models/automacao/Retorno";
import WMS_EnderecoDTO from "../../models/automacao/WMS_EnderecoDTO";
import WMS_ItemOSDTO from "../../models/automacao/WMS_ItemOSDTO";
import WMS_OSDTO from "../../models/automacao/WMS_OSDTO";
import WMS_OSInsert from "../../models/automacao/WMS_OSInsert";
import { formatDate } from "../../utils/dateFormat";
import { checkExistOS, existItemOsAbertoLote, getDataAtual } from "../../utils/dbExecute";

export async function insOrdemServicoLote (_ObjWMS: WMS_OSInsert)
{
    const retorno = new Retorno();
    const osID = checkExistOS("");

    const enderOrigem = new WMS_EnderecoDTO();
    const enderDestino = new WMS_EnderecoDTO();

    let osDto = new WMS_OSDTO();
    let listItemDto: WMS_ItemOSDTO[] = [];

    let lOsLoteVazio = false;
    let lOsTagVazio = false;
    let lCamposNull = false;

    let lExistAB = false;

    const sDataNotFor = await getDataAtual(false);
    const sData = formatDate(sDataNotFor, "amd");
    const sHora = await getDataAtual(true);

    osDto = _ObjWMS.wms_os;
    listItemDto = _ObjWMS.wms_itemos;
    osDto.oSOpTck = String(await checkExistOS(""));
    retorno.code = 200;

    //Tratando os dados recebidos no objeto _ObjWMS
    if(osDto.oSOpTck.length === 0)
    {
        retorno.code = 500;
        retorno.type = "Error";
        retorno.message = "Numero da OP não preenchido, verifique!";
        retorno.data = "WMS_OS->OsOpTck";
    }
    else 
    {
        //Dando um while no objeto de item, para somar o total de peso enviado e outras validações
        for(let o=0; o<listItemDto.length; o++)
        {
            if(listItemDto[o]?.lote.trim().length === 0)
            {
                lOsLoteVazio = true;
            }
            if(listItemDto[o]?.itOsPeso === null || listItemDto[o]?.lote === null || listItemDto[o]?.itOsTagBag === null || _ObjWMS.listaEnder.length === 0)
            {
                lCamposNull = true;
            }

            lExistAB = await existItemOsAbertoLote(
                listItemDto[o]!.itOsTagBag,
                listItemDto[o]!.oSID
            );

            listItemDto[o]!.itOsPesoSoltar = listItemDto[o]!.itOsPeso;
        }
        if(lOsLoteVazio) 
        {
            retorno.code = 500;
            retorno.type = "Error";
            retorno.message = "Existe(m) registros"
        }
    }
}