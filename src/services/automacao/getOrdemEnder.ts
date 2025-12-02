import Retorno from "../../models/automacao/Retorno";
import WMS_ItemOSDTO from "../../models/automacao/WMS_ItemOSDTO";
import WMS_RuaDTO from "../../models/automacao/WMS_RuaDTO";
import { executeQueryLocal, getWMS_OPMoega } from "../../utils/dbExecute";

export async function getOrdemEnder (params: any) {
    if(!params.salto || params.salto.trim().length === 0) {
        params.salto = "0";
    }

    if(!params.regPPagina || params.regPPagina.trim().length === 0) {
        params.regPPagina = "10";
    }

    // Converter para números
    params.salto = parseInt(params.salto);
    params.regPPagina = parseInt(params.regPPagina);

    let enderMoegas = "";
    let tagMoegas = "";

    let sql = `SELECT COUNT(*) OVER() AS TOTAL, 
                    Item.ItOSItem, 
                    Item.OSID, 
                    ISNULL(Item.EmpiCod,'') AS EmpiCod, 
                    ISNULL(Item.MotCod,'') AS MotCod, 
                    ISNULL(Item.ItOSData,'') AS ItOSData, 
                    ISNULL(Item.ItOSHora,'') AS ItOSHora, 
                    ISNULL(Item.ItOsTagBag,'') AS ItOsTagBag, 
                    ISNULL(Item.ItOsTagOrigem,'') AS ItOsTagOrigem, 
                    ISNULL(Item.ItOsTagDestino,'') AS ItOsTagDestino, 
                    ISNULL(Item.ItOSStatus,'') AS ItOSStatus, 
                    ISNULL(Item.ItOsOrigem,'') AS ItOsOrigem, 
                    ISNULL(Item.ItOsDestino,'') AS ItOsDestino, 
                    ISNULL(OS.OSOpTck,'') AS OSOpTck, 
                    ISNULL(OS.OSPrioridade,'') AS OSPrioridade,
                    ISNULL(ItOSLote,'') AS Lote, 
                    ISNULL(ItOsObs,'') AS ItOsObs, 
                    ISNULL(ItOsLibEnder,'') AS ItOsLibEnder, 
                    ISNULL(ItOsPeso,0) AS ItOsPeso,
                    OSData, 
                    OSHora, 
                    OSBlocoSuger, 
                    OSStatus, 
                    ItOsPesoSoltar
                FROM WMS_OS OS, WMS_ItemOS Item
                WHERE OS.OSID=Item.OSID`;

    if(params.osid && params.osid.trim().length > 0) {
        sql += ` AND OS.OSID = @osid`;
    }
    if(params.optck && params.optck.trim().length > 0) {
        sql += ` AND OS.OSOpTck = @optck`;
    }
    if(params.osItem && params.osItem.trim().length > 0) {
        sql += ` AND Item.ItOSItem = @osItem`;
    }
    if(params.login && params.login.trim().length > 0) {
        sql += ` AND Item.MotCod = @login`;
    }
    if(params.prioridade && params.prioridade.trim().length > 0) {
        sql += ` AND OS.OSPrioridade = @prioridade`;
    }
    if(params.origem && params.origem.trim().length > 0) {
        sql += ` AND Item.ItOSOrigem LIKE (@origem)`;
    }
    if(params.destino && params.destino.trim().length > 0) {
        sql += ` AND Item.ItOSDestino LIKE (@destino)`;
    }
    if(params.lote && params.lote.trim().length > 0) {
        sql += ` AND Item.ItOSLote = @lote`;
    }
    if(params.status && params.status.trim().length > 0) {
        sql += ` AND Item.ItOSStatus = @status`;
    }
    if(params.empilhadeira && params.empilhadeira.trim().length > 0) {
        sql += ` AND Item.EmpiCod = @empilhadeira`;
    }
    if(params.dataIni && params.dataIni.trim().length > 0 && params.dataFim && params.dataFim.trim().length > 0) {
        sql += ` AND OS.OSData >= @dataIni`;
        sql += ` AND OS.OSData <= @dataFim`;
    }
    if(params.tagBag && params.tagBag.trim().length > 0) {
        sql += ` AND Item.ItOSTagBag LIKE ('%' + @tagBag + '%')`;
    }
    if(params.osStatus && params.osStatus.trim().length > 0) {
        sql += ` AND OS.OSStatus = @osStatus`;
    }

    sql += ` ORDER BY Item.OSID, Item.ItOSItem`;
    sql += ` OFFSET @salto ROWS FETCH NEXT @regPPagina ROWS ONLY`;

    try {
        const response = await executeQueryLocal(sql, params);

        const listObjOrdem: WMS_ItemOSDTO[] = await Promise.all (
            response.recordset.map( async (item: any) => {
                const objOrdem = new WMS_ItemOSDTO();
                objOrdem.itOSItem = String(item.ItOSItem);
                objOrdem.oSID = String(item.OSID);
                objOrdem.empiCod = item.EmpiCod;
                objOrdem.motCod = item.MotCod;
                objOrdem.itOSData = item.ItOSData;
                objOrdem.itOSHora = item.ItOSHora;
                objOrdem.itOsTagBag = item.ItOsTagBag;
                
                if(item.ItOsDestino.trim() === "MOEGAS") {
                    enderMoegas = await getWMS_OPMoega(item.OSOpTck, "Ender");
                    tagMoegas = await getWMS_OPMoega(item.OSOpTck, "Tag");
                    objOrdem.itOsTagDestino = tagMoegas;
                    objOrdem.itOsDestino = enderMoegas;
                } else {
                    objOrdem.itOsTagDestino = item.ItOsTagDestino;
                    objOrdem.itOsDestino = item.ItOsDestino;
                }
                
                objOrdem.itOsTagOrigem = item.ItOsTagOrigem;
                objOrdem.itOSStatus = item.ItOSStatus;
                objOrdem.itOsOrigem = item.ItOsOrigem;
                objOrdem.lote = item.Lote;
                objOrdem.opTck = item.OSOpTck;
                objOrdem.itOsObs = item.ItOsObs;
                objOrdem.itOsLibEnder = item.ItOsLibEnder;
                objOrdem.itOsPeso = String(item.ItOsPeso);
                objOrdem.itOSLote = item.Lote;
                objOrdem.totRegistros = String(item.TOTAL);
                objOrdem.osData = item.OSData;
                objOrdem.oSHora = item.OSHora;
                objOrdem.oSBlocoSuger = item.OSBlocoSuger;
                objOrdem.oSPrioridade = String(item.OSPrioridade);
                objOrdem.oSStatus = item.OSStatus;
                objOrdem.itOsPesoSoltar = String(item.ItOsPesoSoltar);
                return objOrdem;
            })
        );
        return listObjOrdem;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getOrdemEnder): ${error}`
        })
    }
}