import WMS_EnderecoDTO from "../models/automacao/WMS_EnderecoDTO";
import WMS_ItemOSDTO from "../models/automacao/WMS_ItemOSDTO";
import Retorno from "../models/automacao/Retorno";
import WMS_OSDTO from "../models/automacao/WMS_OSDTO";
import WMS_BagDTO from "../models/automacao/WMS_BagDTO";
import TagValues from "../models/automacao/TagValues";
import Silos from "../models/automacao/Silos";
import { getConnectionLocal, getConnectionNet } from "../database/database";
import Labels from "../models/automacao/Labels";
import SD4_DTO from "../models/automacao/SD4_DTO";

export async function executeQueryLocal(sql: string, params?: Record<string, any>) {
    const pool = await getConnectionLocal();
    const request = pool.request();

    if(params) {
        Object.entries(params).forEach(([key, value]) => {
            // Garantir que valores null/undefined sejam tratados adequadamente
            const processedValue = value === null || value === undefined ? null : value;
            request.input(key, processedValue);
        })
    }

    return request.query(sql);
}

export async function executeQueryNet(sql: string, params?: Record<string, any>) {
    const pool = await getConnectionNet();
    const request = pool.request();

    if(params) {
        Object.entries(params).forEach(([key, value]) => {
            // Garantir que valores null/undefined sejam tratados adequadamente
            const processedValue = value === null || value === undefined ? null : value;
            request.input(key, processedValue);
        })
    }

    return request.query(sql);
}

export async function checkExistOS(op: string): Promise<number> {
    let sql: string;
    
    if (op.length > 0) {
        sql = "SELECT ISNULL(Max(OSID),0) as chvOS FROM WMS_OS WHERE OSOpTck = @op";
        const result = await executeQueryLocal(sql, { op });
        return result.recordset[0].chvOS;
    } else {
        sql = "SELECT ISNULL(Max(OSID)+1,1) as chvOS FROM WMS_OS";
        const result = await executeQueryLocal(sql);
        return result.recordset[0].chvOS;
    }
}

export async function getMaxItemOS(OSId: string): Promise<number> {
    const sql = "SELECT ISNULL(MAX(ItOSItem)+1,1) AS maxNum FROM WMS_ItemOS WHERE OSID = @OSId";
    const result = await executeQueryLocal(sql, { OSId });
    return result.recordset[0].maxNum;
}

export async function getTag(codOuTag: string, tipo: string): Promise<TagValues> {
    let sql = "SELECT 'TESTE' WHERE 1=2";

    if (tipo === 'E') { // tag de chão
        sql = "SELECT EnderTag as tag, '0' as peso, EnderBloco+EnderQuadra as ender, EnderStatus as status, BagTag, BagLote, EnderTipo as tipo FROM WMS_Endereco WHERE EnderCod = @codOuTag";
    } else if (tipo === 'F') { // tag de floor
        sql = "SELECT EnderTag as tag, '0' as peso, EnderBloco+EnderQuadra as ender, EnderStatus as status, BagTag, BagLote, '' as tipo FROM WMS_Endereco WHERE EnderTag = @codOuTag";
    } else if (tipo === 'B') { // tag de bag
        sql = "SELECT BagTag as tag, BagKgAtu as peso, BagTag, BagAtuEnder as ender, BagStatus as status, BagLote, '' AS tipo FROM WMS_Bag WHERE BagTag = @codOuTag";
    }

    const result = await executeQueryLocal(sql, { codOuTag });

    if (result.recordset.length === 0) {
        return new TagValues({ tagStatus: "NExist" });
    }
    return result.recordset[0];
}

export async function getEndereco(enderCod: string): Promise<WMS_EnderecoDTO> {
    let ender = new WMS_EnderecoDTO();

    let sql = "SELECT * FROM WMS_Endereco WHERE EnderCod = @enderCod";

    const result = await executeQueryLocal(sql, { enderCod });

    if (result.recordset && result.recordset.length > 0) {
        for (const row of result.recordset) {
            ender = new WMS_EnderecoDTO();
            ender.enderCod = row.EnderTag || "";
            ender.enderBloco = row.EnderCod || "";
            ender.enderTag = row.EnderBloco || "";
            ender.enderTipo = row.EnderTipo || "";
            ender.enderStatus = row.EnderStatus || "";
        }
    }

    return ender;
}

export async function getEnderDisp(lote: string, blocoOrigem: string, sugerido: string, opSeqID: string) {
    
    let enderecoSelecionado = new WMS_EnderecoDTO();
    let ndxLetraIni = 0;
    let loteLetraIni = '';
    let peneiraLetraFim = '';
    let sugeridoBloco = '';
    enderecoSelecionado.enderCod = "ZZZZZZZ";

    //Capturando as iniciais do lote e iniciais das peneiras
    if(lote.trim().length > 0) {
        //Pegando inicial do lote
        ndxLetraIni = lote.indexOf('-');
        loteLetraIni = lote.substring(0,ndxLetraIni);

        //Pegando final do lote, letra da peneira
        ndxLetraIni = lote.indexOf('/');
        if(ndxLetraIni<=0) {// Não achou a barra, significa que é a nomenclatura nova dos lotes
          //BC-247221CC00
          //0123456789012
          peneiraLetraFim = lote.substring(9,11);  
        } else {
            peneiraLetraFim = lote.substring(ndxLetraIni+3,lote.length);
        }
        if(peneiraLetraFim.length === 0) {
            peneiraLetraFim = "SL";
        }

        //Regras para escolher os lotesLivres: 1) Sugerido pelo Parametro, 2) Parente, 3) Sugerido pela Tabela/Parente, 4) Mais proximo/parente
        //1) Verificando o bloco sugerido enviado no parametro, se tiver preenchido obedece o que foi enviado no parametro e desconsidera as regras do comentário acima
        if(sugerido.trim().length > 0) { //0123456
            if(sugerido.trim().length >= 6) {//100A01A, passou o bloco, quadra e posicao
                sugeridoBloco = sugerido.substring(0,6);
            } else { 
                if(sugerido.trim().length === 4) {//100A, passou bloco e quadra
                    sugeridoBloco = sugerido.substring(0,4);
                } else {
                    sugeridoBloco = sugerido.substring(0,3);
                }
            }
            //Pegando o endereço Livre de acordo com o que foi enviado como sugerido pelo parâmetro
            enderecoSelecionado = await getEnderDestinoSugeridoParametro(sugeridoBloco);
        }

        if (enderecoSelecionado.enderCod === "ZZZZZZZ") {
            //2) Parente
            enderecoSelecionado = await getEnderDestinoParente(lote);
        } 

        if (enderecoSelecionado.enderCod === "ZZZZZZZ") {
            //3) Sugerido pela tabela/Parente
            enderecoSelecionado = await getEnderDestinoSugeridoTabela(loteLetraIni, peneiraLetraFim);
        }

        if (enderecoSelecionado.enderCod === "ZZZZZZZ") {
            //4) Sugerido pela tabela/Parente
            enderecoSelecionado = await getEnderDestinoMaisProximo(blocoOrigem);
        }

        setStatusEnder(enderecoSelecionado.enderCod, "EM");

        return enderecoSelecionado;
    }
}

export async function getEnderDestinoParente(lote: string): Promise<WMS_EnderecoDTO> {
    let enderLivre = new WMS_EnderecoDTO();
    enderLivre.enderCod = "ZZZZZZZ";

    // Corta o lote em no máximo 11 caracteres, lidando com variações de tamanho
    const loteCort = lote.substring(0, Math.min(11, lote.length));

    let sql = "SELECT TOP 1 EnderBloco, EnderQuadra, EnderCod, EnderTag, EnderStatus ";
    sql += "FROM WMS_Endereco ";
    sql += "WHERE EnderStatus = 'LV' ";

    if(lote.trim().length > 11) {
        sql += " AND EnderBloco in (SELECT EnderBloco FROM WMS_Endereco WHERE BagLote LIKE @loteCort + '%')"
    } else {
        sql += " AND EnderBloco in (SELECT EnderBloco FROM WMS_Endereco WHERE BagLote LIKE @lote + '%'"
    }

    sql += " ORDER BY EnderCod";

    const result = await executeQueryLocal(sql, { loteCort });

    if (result.recordset && result.recordset.length > 0) {
        for (const row of result.recordset) {
            enderLivre = new WMS_EnderecoDTO();
            enderLivre.enderTag = row.EnderTag || "";
            enderLivre.enderCod = row.EnderCod || "";
            enderLivre.enderBloco = row.EnderBloco || "";
        }
    }

    return enderLivre;
}

export async function getEnderDestinoSugeridoParametro(sugeridoBloco: string): Promise<WMS_EnderecoDTO> {
    let enderLivre = new WMS_EnderecoDTO();
    enderLivre.enderCod = "ZZZZZZZ";

    let sql = "SELECT TOP 1 EnderBloco, EnderQuadra, EnderCod, EnderTag, EnderStatus ";
    sql += " FROM WMS_Endereco ";
    sql += " WHERE EnderStatus = 'LV' ";
    sql += " AND EnderTipo <> 'EMBEG' ";
    sql += " AND EnderCod LIKE @sugeridoBloco ORDER BY EnderCod";
    
    const result = await executeQueryLocal(sql, { sugeridoBloco });

    if (result.recordset && result.recordset.length > 0) {
        for (const row of result.recordset) {
            enderLivre = new WMS_EnderecoDTO();
            enderLivre.enderTag = row.EnderTag || "";
            enderLivre.enderCod = row.EnderCod || "";
            enderLivre.enderBloco = row.EnderBloco || "";
        }
    }

    return enderLivre;
}

export async function getEnderDestinoSugeridoTabela(inicialLote: string, peneira: string): Promise<WMS_EnderecoDTO> {
    let enderLivre = new WMS_EnderecoDTO();
    enderLivre.enderCod = "ZZZZZZZ";

    let sql = "SELECT TOP 1 EnderBloco, EnderQuadra, EnderCod, EnderTag, EnderStatus ";
    sql += " FROM WMS_Endereco ";
    sql += " WHERE EnderStatus = 'LV' ";
    sql += " AND EnderBloco in (SELECT LoteBloco FROM WMS_LoteEnder WHERE LoteInicial = @inicialLote AND LotePeneira = @peneira";
    sql += " ORDER BY EnderCod";
    
    const result = await executeQueryLocal(sql, { inicialLote, peneira });

    if (result.recordset && result.recordset.length > 0) {
        for (const row of result.recordset) {
            enderLivre = new WMS_EnderecoDTO();
            enderLivre.enderTag = row.EnderTag || "";
            enderLivre.enderCod = row.EnderCod || "";
            enderLivre.enderBloco = row.EnderBloco || "";
        }
    }

    return enderLivre;
}

export async function getEnderDestinoMaisProximo(origem: string) {
    let enderLivre = new WMS_EnderecoDTO();
    enderLivre.enderCod = "ZZZZZZZ";

    let sql = "SELECT TOP 1 EnderCod, EnderTag, EnderQuadra, Ender.EnderBloco ";
    sql += "FROM WMS_Endereco Ender, WMS_EnderDist Dist ";
    sql += "WHERE ";
    sql += "Ender.EnderBloco = Dist.EnderBlocoDestino AND ";
    sql += "EnderStatus = 'LV' AND ";
    sql += "EnderTipo = 'PISO' AND ";
    sql += "EnderBlocoOrigem = @origem ";
    sql += "ORDER BY EnderDistancia, EnderCod ";

    const result = await executeQueryLocal(sql, { origem });

    if (result.recordset && result.recordset.length > 0) {
        for (const row of result.recordset) {
            enderLivre = new WMS_EnderecoDTO();
            enderLivre.enderTag = row.EnderTag || "";
            enderLivre.enderCod = row.EnderCod || "";
            enderLivre.enderBloco = row.EnderBloco || "";
        }
    }

    return enderLivre;
}

export async function setStatusEnder(endereco: string, status: string) {
    let sql = "UPDATE WMS_Endereco SET EnderStatus = @status WHERE EnderCod = @endereco";

    const result = await executeQueryLocal(sql, { endereco, status});

    return result;
}

export async function buscaRecnoZ71(): Promise<number> {
    let sql = "SELECT MAX(R_E_C_N_O_)+1 AS recno FROM Z71010";

    const result = await executeQueryLocal(sql);
    console.log("Valor Recno", result.recordset);
    
    const recno = result.recordset[0].recno;

    return recno;
}
export async function buscaProxLoteZ71(lote: string) {
    let sql = "SELECT ISNULL(MAX(Z71_LOTECT),0) AS LOTE FROM Z71010";
    sql += " WHERE Z71_LOTECT LIKE @lote"

    const result = await executeQueryLocal(sql, { lote });

    let sequencia = result.recordset[0]?.LOTE || "00";
    let nSeq = 0;
    let retorno = "00";

    if (sequencia.length > 11) {
        const ultimosDois = sequencia.slice(-2);// Ultimos 2 caracteres
        const numero = parseInt(ultimosDois, 10);
        if(!isNaN(numero)) {
            nSeq = numero + 1;
        } else {
            return "00";
        }
    }

    retorno = nSeq <= 9 ? `0${nSeq}` : `${nSeq}`;
    return retorno;
}

export async function buscaSEQZ71(op: string, lote: string, data: string, opTck: string): Promise<number> {
    const sql = "SELECT ISNULL(MAX(Z71_SEQLOT)+1, 1) as maxSeq FROM Z71010 WHERE Z71_SETOR <> 'DESCARGA' AND Z71_OP = @op AND Z71_LOTECT LIKE @lote AND Z71_OPTCK = @opTck";
    let seq = 1;
    
    try{ 
        const response = await executeQueryLocal(sql, { op, lote, opTck });
        
        if (response.recordset && response.recordset.length > 0) {
            seq = response.recordset[0].maxSeq || 1; 
        }
        if (seq < 1) {
            seq = 1;
        }
    } catch (error) {
        console.error("Erro ao buscar sequência", error);
    }

    return seq;
}

export async function setWMSItemOS(wmsItem: WMS_ItemOSDTO): Promise <Retorno> {
    let dto = new Retorno();
    let lRet = true;

    const chvItemOS = await getMaxItemOS(wmsItem.oSID);
    let enderDestino : WMS_EnderecoDTO = await getEnderDisp("","",wmsItem.itOsDestino,"") ?? new WMS_EnderecoDTO();

    if(wmsItem.itOSItem.length == 0) {
        wmsItem.itOSItem = chvItemOS.toString();
    }

    if(wmsItem.itOsDestino.length > 0 && wmsItem.itOsDestino.length <=3) {
        enderDestino = await getEnderDisp("","",wmsItem.itOsDestino,"") ?? new WMS_EnderecoDTO();
        wmsItem.itOsDestino = enderDestino.enderCod;
        wmsItem.itOsTagDestino = enderDestino.enderTag;
    }

    const sql = `INSERT INTO WMS_ItemOS (OSID, ItOSItem, 
    EmpiCod, MotCod, ItOSData, ItOSHora, ItOsLote, 
    ItOsTagBag, ItOsOrigem, ItOsDestino, ItOsTagDestino, 
    ItOSStatus, ItOsPeso, ItOsObs, ItOsLibEnder) 
    VALUES 
    (@empiCod, @motCod, @itOsData, @itOsHora, @lote,
        @itOsTagBag, @itOsOrigem, @itOsTagOrigem,
        @itOsDestino, @itOsTagDestino, @itOsStatus,
        @oSID, @itOSItem)`;

    const params = {
        empiCod: wmsItem.empiCod || "",
        motCod: wmsItem.motCod || "",
        itOsData: wmsItem.itOSData || "",
        itOsHora: wmsItem.itOSHora || "",
        lote: wmsItem.lote || "",
        itOsTagBag: wmsItem.itOsTagBag || "",
        itOsOrigem: wmsItem.itOsOrigem || "",
        itOsTagOrigem: wmsItem.itOsTagOrigem || "",
        itOsDestino: enderDestino.enderCod || wmsItem.itOsDestino || "",
        itOsTagDestino: enderDestino.enderTag || wmsItem.itOsTagDestino || "",
        itOsStatus: wmsItem.itOSStatus || "AB",
        oSID: wmsItem.oSID,
        itOSItem: wmsItem.itOSItem
    };

    try {
        await executeQueryLocal(sql, params);
        dto.code = 600;
        dto.type = "OK";
        dto.message = "Dado gravado com sucesso!";
        dto.data = wmsItem.itOSItem.toString();
        return dto;
    } catch (error) {
        lRet = false;
        dto.code = 500;
        dto.type = "Error";
        dto.message = "Dado não gravado, contate o administrador";
        dto.data = "";
        return dto;
    }
}

export async function setWMSOS(wms: WMS_OSDTO) {
    let dto = new Retorno();
    let lRet = true;

    let chvOS = checkExistOS("");

    if(wms.oSID.length == 0) {
        wms.oSID = (await chvOS).toString();
    }

    let sql = `INSERT
                INTO WMS_OS
                (OSID,
                MotCod,
                OSOpTck,
                OSPrioridade,
                OSBlocoSuger,
                OSData,
                OSHora)
               VALUES (
               @oSID,
               @motCod,
               @oSOpTck,
               @oSPrioridade,
               @osBlocoSuger,
               @oSData,
               @oSHora)`

    const params = {
        oSID: wms.oSID,
        motCod: wms.motCod,
        oSOpTck: wms.oSOpTck,
        oSPrioridade: wms.oSPrioridade,
        oSBlocoSuger: wms.oSBlocoSuger,
        oSData: wms.oSData,
        oSHora: wms.oSHora
    };

    try {
        await executeQueryLocal(sql, params);
        dto.code = 600;
        dto.type = "OK";
        dto.message = "Dado gravado com sucesso!";
        dto.data = (await chvOS).toString();
        return dto;
    } catch (error) {
        lRet = false;
        dto.code = 500;
        dto.type = "Error";
        dto.message = "Dado não gravado, contate o administrador";
        dto.data = "";
        return dto;
    }
}

export async function existWMSBag(id: string, status: string) {
    let sql = "SELECT BagTag FROM WMS_Bag WHERE BagTag = @id";
    if(status.trim().length > 0) {
        sql += " AND BagStatus = @status";
    }

    const result = await executeQueryLocal(sql, { id , status });

    return result.recordset.length > 0;
}

export async function insWMSBag(id: string, lote: string, status: string, atuEnder: string, ultEnder: string, peso: number) {
    let sql = `INSERT
                INTO WMS_Bag
                (BagTag,
                 BagLote,
                 BagStatus,
                 BagAtuEnder,
                 BagUltEnder,
                 BagLinha,
                 BagPen17,
                 BagPen14,
                 BagPVA,
                 BagGrinder,
                 BagImpureza,
                 BagKgAtu,
                 BagScAtu)
                 VALUES
                 (@tag,
                  @lote,
                  @status,
                  @atuEnder,
                  @ultEnder,
                  @linha,
                  @pen17,
                  @pen14,
                  @pva,
                  @grinder,
                  @impureza,
                  @peso,
                  @sacas)`;

    const params = {
        tag: id,
        lote: lote,
        status: status,
        atuEnder: atuEnder,
        ultEnder: ultEnder,
        linha: "-",
        pen17: 0,
        pen14: 0,
        pva: 0,
        grinder: 0,
        impureza: 0,
        peso: peso,
        sacas: peso/59
    }

    await executeQueryLocal(sql, params);
}

export async function updWMSBag(id: string, lote: string, status: string, atuEnder: string, ultEnder: string, peso: number): Promise<void> {
    let sql = `UPDATE WMS_Bag SET BagLote = @lote, BagStatus = @status, BagAtuEnder = @atuEnder, BagUltEnder = @ultEnder, BagKgAtu = @peso, BagScAtu = @sacas WHERE BagTag = @id`;

    const params = {
        id: id,
        lote: lote,
        status: status,
        atuEnder: atuEnder,
        ultEnder: ultEnder,
        peso: peso,
        sacas: peso/59
    }

    await executeQueryLocal(sql, params);
}

export async function setStatusOPSeq(seqOPID: number, status: string): Promise<void> {
    let sql = `UPDATE WMS_SeqOP SET SeqOpStatus = @status WHERE SeqOpID = @seqOPID`;

    const params = { 
        seqOPID: seqOPID,
        status: status
    }

    await executeQueryLocal(sql, params);
}

export async function getMaxMovEnderID(): Promise<string> {
    let sql = `SELECT MAX(MovEnderID)+1 AS maxNum FROM WMS_MovEnder `;

    const result = await executeQueryLocal(sql);
    return result.recordset[0]?.maxNum;
}

export async function getBag(_BagTag: string): Promise<WMS_BagDTO> {
    const dto = new WMS_BagDTO();

    let sql = `SELECT BagTag, BagLote, BagStatus, BagAtuEnder, BagUltEnder, BagKgAtu,
        ISNULL(BagLinha,'') AS BagLinha, ISNULL(BagPen17,0) AS BagPen17, ISNULL(BagPen14,0) AS BagPen14,
        ISNULL(BagPVA,0) AS BagPVA, ISNULL(BagGrinder,0) AS BagGrinder,
        ISNULL(BagImpureza,0) AS BagImpureza,
        ISNULL((SELECT TOP 1 EnderTag FROM WMS_Endereco WHERE EnderCod = BagAtuEnder),'') AS TagEnder
        FROM WMS_Bag 
        WHERE BagTag = @bagTag`

    const result = await executeQueryLocal(sql, { bagTag: _BagTag});

    if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        dto.bagTag = row.BagTag;
        dto.bagLote = row.BagLote;
        dto.bagStatus = row.BagStatus;
        dto.bagAtuEnder = row.BagAtuEnder;
        dto.bagUltEnder = row.BagUltEnder;
        dto.bagKgAtu = row.BagKgAtu;
        dto.bagLinha = row.BagLinha;
        dto.bagPen17 = row.BagPen17;
        dto.bagPen14 = row.BagPen14;
        dto.bagPva = row.BagPVA;
        dto.bagGrinder = row.BagGrinder;
        dto.BagImpureza = row.BagImpureza;
        dto.tagAtuEnder = row.TagEnder.trim();
    } else {
        dto.bagStatus = "LV";
        dto.bagKgAtu = 0;
    }

    return dto;
}

export async function updSiloSaldo(_SiloDto: Silos[],_Quant: number,_ES: string,_Lote: string) {
  for (const silo of _SiloDto) {
    const nSaldoFim = _ES === "E"
      ? parseFloat(silo.siloSaldo) + _Quant
      : parseFloat(silo.siloSaldo) - _Quant;

    const addUpdLote = _ES === "E" ? ", SiloLote = @lote" : "";

    const sql = `
      UPDATE SUP_Silos
      SET SiloSaldo = @nSaldoFim ${addUpdLote}
      WHERE SiloCod = @siloCod
    `;

    const params = {
      nSaldoFim,
      lote: _Lote,
      siloCod: silo.siloCod
    };

    await executeQueryLocal(sql, params);
  }
}

export async function getSilo(_SiloCod: string) {
    let sql = `SELECT SiloCod, SiloDescr, SiloSetor, SiloCapac, SiloSaldo, SiloLote
               FROM SUP_Silos `;

    if(_SiloCod !== "Todos") {
        if(_SiloCod === "APP") {
            sql += `WHERE SiloEstqSN = 'S'`;
        } else {
            sql += `WHERE SiloCod = @siloCod`;
        }
    }

    const params = _SiloCod !== "Todos" && _SiloCod !== "APP" ? { siloCod: _SiloCod }: {};
    const result = await executeQueryLocal(sql, params);

    const lst: Silos[] = result.recordset.map((row: any) => ({
        siloCod: row.SiloCod,
        siloDescr: row.SiloDescr,
        SiloSetor: row.SiloSetor,
        siloCapac: Math.round(row.SiloCapac).toString(),
        siloSaldo: Math.round(row.SiloSaldo).toString(),
        siloPercOcup: row.SiloCapac ? Math.round((row.SiloSaldo / row.SiloCapac) * 100).toString() : "0",
        siloLote: row.SiloLote
    })) as Silos[];

    lst.push({ siloCod: "Linha1", siloDescr: "Linha 1", siloCapac: "0"} as Silos);
    lst.push({ siloCod: "Linha2", siloDescr: "Linha 2", siloCapac: "0"} as Silos);

    return lst;
}

export async function getMovSiloID() {
    const sql = `SELECT MAX(MovSiloID)+1 AS MAX FROM SUP_MovSilo`;
    const max = await executeQueryLocal(sql);
    return max.recordset[0].MAX.toString();
}

export async function getDataAtual(comHora: boolean = false): Promise<string> {
    const hoje = new Date();

    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();

    if(comHora){
        const horas = String(hoje.getHours()).padStart(2, "0");
        const minutos = String(hoje.getMinutes()).padStart(2, "0");

        return `${horas}:${minutos}`;
    }

    return `${dia}/${mes}/${ano}`;
}

export async function getTotEnderDisp(_Bloco: string, _Quadra: string, _Posicao: string) {
    let iDisp = "";
    let sql = `SELECT COUNT(*) AS TOTDISP
                FROM WMS_Endereco
                 WHERE EnderStatus = 'LV'
                  AND EnderBloco = @_Bloco `;
    
    if(_Quadra.trim().length > 0) {
        sql += "AND EnderQuadra = @_Quadra ";
    }
    if(_Posicao.trim().length > 0) {
        sql += "AND EnderPosicao = @_Posicao ";
    }

    try {
        const result = await executeQueryLocal(sql, {_Bloco, _Quadra, _Posicao});
        iDisp = result.recordset[0]?.TOTDISP;
        return new Retorno ({
            code: 600,
            type: "OK",
            data: iDisp,
            message: `Encontrados ${iDisp} locais livres!`
        });
    } catch (error) {
        return new Retorno ({
            code: 700,
            type: "NoData",
            data: iDisp,
            message: `Não foram encontrados lotes disponíveis!`
        })
    }
}

export async function getGridCollum(grid: string, user: string): Promise<Labels[]> {
    try {
        const sql = `SELECT * FROM Cmx_Grid WHERE GridID = @grid AND UserLogin = @user ORDER BY GridNdx`;

        const result = await executeQueryLocal(sql, { grid, user });

        const listLabels: Labels [] = result.recordset.map((row: any) => {
            const label = new Labels();
            label.label = row.GridLabel?.trim() || "";
            label.key = row.GridData?.trim() || "";
            label.exibe = row.GridExibe?.trim() || "";
            return label;
        });
        return listLabels;
    } catch (error) {
            console.error("Erro ao buscar colunas do grid:", error);
            return [];
    }
}

export async function getListaEmpenhoOS(op: string) {
    const sql = `SELECT ItOsTagBag FROM WMS_OS os, WMS_ItemOS item 
                    WHERE os.OSID = item.OSID
                    AND ItOSStatus = 'AB'
                    AND OSOptck = @op`;
    try {
        const response = await executeQueryLocal(sql);

        const listaSD4: SD4_DTO[] = response.recordset.map((item: any) => {
            const sd4Dto = new SD4_DTO();
            sd4Dto.lote = item.ItOsTagBag;
            return listaSD4;
        })

        return listaSD4;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getListaEmpenho): ${error}`
        })
    }
}

export async function getEmpenhoLote(lote: string): Promise<string[]> {
    const ret: string[] = ["Não", "0", ""];

    const sql = `SELECT TOP 1 ItOsPeso, OSOpTck 
                 FROM WMS_OS OS, WMS_ItemOS Item 
                 WHERE OS.OSID = Item.OSID 
                 AND ItOsStatus = 'AB' 
                 AND ItOSLote = @lote`;

    try {
        const result = await executeQueryLocal(sql, { lote });

        if (result.recordset && result.recordset.length > 0) {
            const row = result.recordset[0];
            return ["Sim", row.ItOsPeso?.toString() || "0", row.OSOpTck || ""];
        }

        return ret;
    } catch (error) {
        console.error("Erro ao buscar empenho do lote:", error);
        return ret;
    }
}

export async function getWMS_OPMoega(op: string, tipo: string): Promise<string> {
    let cCampo = "";

    if(tipo === "Ender") {
        cCampo = "EnderCod";    
    } else {
        cCampo = "EnderTag";
    }

    const sql = `SELECT ${cCampo} FROM WMS_OPMoega WHERE OpNum = @op`;
    try {
        const result = await executeQueryLocal(sql, { op });

        let conteudo = result.recordset.map((item: any) => item[cCampo].trim()).join(";");

        return conteudo;
    } catch (error) {
        console.error("Erro ao buscar WMS_OPMoega:", error);
        return "";
    }
}

export async function getItemOSOPAberto (op: string): Promise<string> { 
    const sql = `SELECT ItOSItem FROM WMS_OS Cab, WMS_ItemOS Item WHERE Cab.OSID=Item.OSID AND ItOsStatus IN ('AB','ET') AND OSOpTck = @op`
    try {
        const response = await executeQueryLocal(sql, { op });

        return response;
    } catch (error) {
        console.error("Erro ao buscar getItemOSOPAberto:", error);
        return "";
    }
}

export async function getsd4 (op: string) {
    //Buscar os empenhos da OP
    const sql = `SELECT D4_OP AS OP, D4_LOCAL AS LOCAL, D4_LOTECTL AS LOTE, D4_QUANT AS PESO, D4_QTDEORI AS PESOORI FROM SD4010 WHERE D_E_L_E_T_<>'*' AND D4_COD = '00100' AND D4_FILIAL = '05' AND SUBSTRING(D4_OP,1,6) = @op
                UNION
                SELECT Z45_OP AS OP, '01' AS LOCAL, Z45_LOTWMS AS LOTE, Z45_PESO AS PESO, Z45_PESO AS PESOORI FROM Z45010 WHERE D_E_L_E_T_<>'*' AND Z45_LOTWMS <> '' AND Z45_FILIAL = '05' AND SUBSTRING(Z45_OP,1,6) = @op ORDER BY 3`;

    try {
        const response = await executeQueryLocal(sql, { op });

        const listaSD4 = response.recordset.map((item: any) => {
            let sd4Dto = new SD4_DTO();
            sd4Dto.local = item.LOCAL;
            sd4Dto.lote = item.LOTE;
            sd4Dto.qtdori = item.PESOORI;
            sd4Dto.quant = item.PESO;
            return sd4Dto;
        })

        return listaSD4;
    } catch (error) {
        console.error("Erro ao buscar getItemOSOPAberto:", error);
        return "";
    }
}

export async function setInsWMSOS (wms: WMS_OSDTO): Promise<Retorno> {
    let chvOS = await checkExistOS("");
    if(wms.oSID.length === 0) {
        wms.oSID = chvOS.toString();
    }

    const sql = `INSERT INTO WMS_OS (OSID, MotCod, OSOpTck, OSPrioridade, OSBlocoSuger, OSData, OSHora, OSStatus) VALUES(@OSID,@MotCod,@OSOpTck,@OSPrioridade,@OSBlocoSuger,@OSData,@OSHora,@OSStatus)`;

    const params = {
        OSID: wms.oSID,
        MotCod: wms.motCod,
        OSOpTck: wms.oSOpTck,
        OSPrioridade: wms.oSPrioridade,
        OSBlocoSuger: wms.oSBlocoSuger,
        OSData: wms.oSData,
        OSHora: wms.oSHora,
        OSStatus: wms.oSStatus
    }
    try {
        await executeQueryLocal(sql, { params });  
        
        return new Retorno ({
            code: 600,
            type: "OK",
            message: "Dado gravado com sucesso!",
            data: chvOS.toString()
        })
    } catch (error) {
        return new Retorno ({
            code: 500,
            type: "Error",
            message: "Dado não gravado, contate o administrador (setInsWMSOS)"
        })
    }
}

export async function getListaBagSD4 (lote: string): Promise<WMS_BagDTO[] | string> {
    const sql = `SELECT BagTag, BagLote, BagStatus, BagAtuEnder, BagUltEnder, BagKgAtu FROM WMS_Bag
                WHERE BagLote = @lote
                AND BagTag NOT IN (SELECT ItOsTagBag FROM WMS_ItemOS WHERE ItOSStatus = 'AB' AND ItOsTagBag = BagTag)
                ORDER BY BagAtuEnder DESC`;

    try {
        const response = await executeQueryLocal(sql, { lote });

        const listBag = response.recordset.map((item: any) => {
            let dto = new WMS_BagDTO();
            dto.bagTag = item.BagTag;
            dto.bagLote = item.BagLote;
            dto.bagStatus = item.BagStatus;
            dto.bagAtuEnder = item.BagAtuEnder;
            dto.bagUltEnder = item.BagUltEnder;
            dto.bagKgAtu = item.BagKgAtu;
            dto.bagKgCorte = 0;
            return dto;
        })

        return listBag;
    } catch (error) {
        console.error("Erro ao buscar getListaBagSD4:", error);
        return "";
    }
}

export async function insWMS_OPMoega (opNum: string, enderCod: string, enderTag: string) {
    const sqlDel = `DELETE FROM WMS_OPMoega WHERE OpNum = @opNum AND EnderTag = @enderTag AND EnderCod = @enderCod`
    const sqlIns = `INSERT INTO WMS_OPMoega (OpNum, EnderTag, EnderCod) VALUES(@opNum,@enderTag,@enderCod)`;
    try {
        await executeQueryLocal(sqlDel);
        await executeQueryLocal(sqlIns);
    } catch (error) {
        console.error("Erro ao inserir insWMS_OPMega:", error);
        return "";
    }
}

export async function setInsWMSItemOS (wmsItem: WMS_ItemOSDTO) {
    let chvItemOS = getMaxItemOS(wmsItem.oSID);
    let enderDestino = new WMS_EnderecoDTO();

    if(wmsItem.itOSItem.length === 0) { //Se a chave estiver vazia no objeto, usar a chave encontrada na função getMaxItemOS
        wmsItem.itOSItem = chvItemOS.toString();
    }

    if(wmsItem.itOsDestino.length > 0 && wmsItem.itOsDestino.length <= 3){//Passando apenas bloco e quadra '100A'
        //Buscando o endereço de destino dos lotes
        //enderDestino = await getEnderDisp("","",wmsItem.itOsDestino, "")!;
    } 

}

//==================================================================================================================
// FUNÇÕES DE ANÁLISE DE INTERSEÇÕES GEOGRÁFICAS
//==================================================================================================================

const booleanIntersects = require('@turf/boolean-intersects').default;
const bbox = require('@turf/bbox').default;
const area = require('@turf/area').default;
const buffer = require('@turf/buffer').default;
const { polygon, multiPolygon } = require('@turf/helpers');
const jsts = require('jsts');

/**
 * Fragmenta um MultiPolygon em múltiplos Polygons simples
 */
export function polygonsFromFeature(feat: any) {
    const geom = feat.geometry;
    if (geom.type === 'Polygon') return [polygon(geom.coordinates, feat.properties)];
    if (geom.type === 'MultiPolygon') {
        return geom.coordinates.map((coords: any) => polygon(coords, feat.properties));
    }
    return [];
}

/**
 * Limpa geometrias inválidas aplicando buffer zero
 */
export function cleanGeometry(feat: any) {
    try {
        return buffer(feat, 0, { units: 'meters' });
    } catch (err) {
        return feat;
    }
}

/**
 * Converte Feature GeoJSON para geometria JSTS
 */
export function toJSTS(geojson: any) {
    if (!geojson) return null;
    try {
        const geoReader = new jsts.io.GeoJSONReader();
        const jgeom = geoReader.read(geojson);
        return jgeom;
    } catch (err) {
        return null;
    }
}

/**
 * Converte geometria JSTS para Feature GeoJSON
 */
export function fromJSTS(jgeom: any) {
    if (!jgeom) return null;
    try {
        const geoWriter = new jsts.io.GeoJSONWriter();
        const geo = geoWriter.write(jgeom);
        return { type: 'Feature', geometry: geo, properties: {} };
    } catch (err) {
        return null;
    }
}

/**
 * Calcula diferença entre duas features (B - A) de forma robusta
 */
export function safeDifferenceJSTS(featB: any, featA: any) {
    try {
        const jA = toJSTS(featA);
        const jB = toJSTS(featB);
        if (!jA || !jB) return null;
        const diff = jB.difference ? jB.difference(jA) : (jB.geometry ? jB.geometry.difference(jA.geometry) : null);
        if (!diff || diff.isEmpty()) return null;
        return fromJSTS(diff);
    } catch (err) {
        return null;
    }
}

/**
 * Calcula diferença com múltiplas estratégias de fallback
 */
export function safeDifference(featB: any, featA: any) {
    // Estratégia 1: Tentativa direta com JSTS
    let result = safeDifferenceJSTS(featB, featA);
    if (result) return result;

    // Estratégia 2: Limpeza de geometrias e nova tentativa
    const cleanA = cleanGeometry(featA);
    const cleanB = cleanGeometry(featB);

    result = safeDifferenceJSTS(cleanB, cleanA);
    if (result) return result;

    // Estratégia 3: Fragmentação em polígonos simples
    const partsB = polygonsFromFeature(cleanB);
    const partsA = polygonsFromFeature(cleanA);

    const resultParts = [];

    // Subtrai cada parte de A de cada parte de B sequencialmente
    for (let i = 0; i < partsB.length; i++) {
        let current = partsB[i];
        for (let j = 0; j < partsA.length; j++) {
            try {
                const d = safeDifferenceJSTS(current, partsA[j]);
                current = d || current;
            } catch (err) {
                // Ignora erros e continua com a geometria atual
            }
        }
        // Extrai coordenadas da geometria resultante
        if (current) {
            if (current.geometry && current.geometry.type === 'Polygon') {
                resultParts.push(current.geometry.coordinates);
            } else if (current.geometry && current.geometry.type === 'MultiPolygon') {
                resultParts.push(...current.geometry.coordinates);
            }
        }
    }

    if (!resultParts.length) return null;

    // Reconstrói Feature com as partes resultantes
    if (resultParts.length === 1) return polygon(resultParts[0]);
    return multiPolygon(resultParts);
}

/**
 * Calcula diferença garantindo um espaçamento mínimo entre geometrias
 * Aplica um buffer na geometria menor antes de subtrair da maior
 * @param featB - Feature maior (será cortada)
 * @param featA - Feature menor (será mantida e expandida com buffer)
 * @param gapMeters - Espaçamento mínimo em metros (padrão: 0.5m)
 */
export function safeDifferenceWithGap(featB: any, featA: any, gapMeters: number = 0.5) {
    const turf_buffer = require('@turf/buffer').default;
    
    try {
        // Aplica buffer positivo na geometria menor para criar espaçamento
        const featAWithBuffer = turf_buffer(featA, gapMeters, { units: 'meters' });
        
        if (!featAWithBuffer) {
            // Se falhar o buffer, usa diferença normal
            return safeDifference(featB, featA);
        }
        
        // Realiza a diferença com a geometria expandida
        return safeDifference(featB, featAWithBuffer);
    } catch (err) {
        console.error('Erro ao aplicar buffer com espaçamento:', err);
        // Em caso de erro, tenta diferença normal
        return safeDifference(featB, featA);
    }
}

/**
 * Normaliza diferentes formatos de entrada GeoJSON
 */
export function normalizeGeoJSON(raw: any, id: string) {
    if (!raw) return null;
    let parsed;
    try {
        parsed = (typeof raw === 'string') ? JSON.parse(raw.replace(/\u0000/g, '').trim()) : raw;
    } catch (e) {
        return null;
    }

    // Se for FeatureCollection, extrai a primeira feature
    if (parsed.type === 'FeatureCollection') {
        if (!parsed.features || !parsed.features.length) return null;
        parsed = parsed.features[0];
    }

    // Converte Geometry para Feature
    if (parsed.type !== 'Feature') {
        parsed = { type: 'Feature', geometry: parsed, properties: {} };
    }

    // Valida geometria e aceita apenas Polygon ou MultiPolygon
    if (!parsed.geometry || !parsed.geometry.type) return null;
    if (!['Polygon', 'MultiPolygon'].includes(parsed.geometry.type)) {
        return null;
    }

    return parsed;
}

/**
 * Verifica interseções entre geometrias
 */
export function detectIntersections(features: any[]) {
    const intersections: any[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < features.length; i++) {
        const itemA = features[i];
        if (!itemA.feature) continue;

        for (let j = i + 1; j < features.length; j++) {
            const itemB = features[j];
            if (!itemB.feature) continue;

            const key = `${itemA.id}-${itemB.id}`;
            if (seen.has(key)) continue;
            seen.add(key);

            // Verifica se há interseção
            let intersects = false;
            try {
                intersects = booleanIntersects(itemA.feature, itemB.feature);
            } catch (err) {
                // Ignora erros de geometria
            }

            if (intersects) {
                intersections.push({
                    car_contrato: itemA.id,
                    identi_contrato: itemA.identi,
                    car_conflito: itemB.id,
                    identi_conflito: itemB.identi,
                    geojson_conflito: JSON.stringify(itemB.feature.geometry),
                    tipo: 'interno'
                });
            }
        }
    }

    return intersections;
}

/**
 * Detecta conflitos de interseção com CARs externos ao contrato
 */
export async function detectConflitosExternos(featuresContrato: any[], executeQuery: Function) {
    const conflitosExternos: any[] = [];
    const carsDoContrato = new Set(featuresContrato.map(f => f.id));

    if (carsDoContrato.size === 0) return conflitosExternos;

    // Buscar todos os CARs do banco que não fazem parte deste contrato
    const sqlTodosCars = `SELECT DISTINCT 
                            Z0C.Z0C_CAR AS car, 
                            Z0C.Z0C_IDENTI AS identi,
                            CASE 
                                WHEN Z0C.Z0C_GEOCOR IS NOT NULL AND LTRIM(RTRIM(Z0C.Z0C_GEOCOR)) <> '' 
                                THEN Z0C.Z0C_GEOCOR 
                                ELSE Z0C.Z0C_GEOJSO 
                            END AS geojson
                          FROM Z0C010 Z0C
                          WHERE Z0C.D_E_L_E_T_ <> '*'
                          AND Z0C.Z0C_CAR NOT IN (${Array.from(carsDoContrato).map(c => `'${c}'`).join(',')})`;

    const responseTodosCars = await executeQuery(sqlTodosCars, {});

    const intersectionArea = require('@turf/intersect').default;

    // Processar CARs externos e verificar interseções
    for (const carExterno of responseTodosCars.recordset) {
        const featExterno = normalizeGeoJSON(carExterno.geojson, carExterno.car);
        if (!featExterno) continue;

        // Verificar interseção com cada CAR do contrato
        for (const carContrato of featuresContrato) {
            let intersects = false;
            let areaIntersecao = 0;
            
            try {
                intersects = booleanIntersects(carContrato.feature, featExterno);
                
                // Se houver interseção, calcular a área
                if (intersects) {
                    const intersection = intersectionArea(carContrato.feature, featExterno);
                    if (intersection) {
                        areaIntersecao = area(intersection);
                    }
                }
            } catch (err) {
                // Ignora erros
            }

            if (intersects) {
                conflitosExternos.push({
                    car_contrato: carContrato.id,
                    identi_contrato: carContrato.identi,
                    car_conflito: carExterno.car,
                    identi_conflito: carExterno.identi,
                    geojson_conflito: JSON.stringify(featExterno.geometry),
                    tipo: 'externo'
                });
            }
        }
    }

    return conflitosExternos;
}

//==================================================================================================================
//==================================================================================================================
//==================================================================================================================
//==================================================================================================================
//==================================================================================================================
//==================================================================================================================

