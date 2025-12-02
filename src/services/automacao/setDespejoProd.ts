import { date } from "zod/v4";
import Retorno from "../../models/automacao/Retorno";
import WMS_OSDTO from "../../models/automacao/WMS_OSDTO";
import { checkExistOS, getEndereco, getItemOSOPAberto, getListaBagSD4, getMaxItemOS, getsd4, insWMS_OPMoega, setInsWMSOS } from "../../utils/dbExecute";
import WMS_BagDTO from "../../models/automacao/WMS_BagDTO";
import WMS_ItemOSDTO from "../../models/automacao/WMS_ItemOSDTO";
import WMS_EnderecoDTO from "../../models/automacao/WMS_EnderecoDTO";

export async function setDespejoProd (params: any) {
    let nQtdEmpenho = 0;
    let nQtdBag = 0;
    let nSomaBag = 0;
    let nQtdParte = 0;
    let chvOS = await checkExistOS("");
    let nQtdIns = 0;
    let chvItemOS = 0;
    let lContinua = true;
    let wmsOS = new WMS_OSDTO();
    let enderOrigem = new WMS_EnderecoDTO();
    let enderDestino = new WMS_EnderecoDTO();

    let lOSAberto = await getItemOSOPAberto(params.op);

    const listaSD4 = await getsd4(params.op);

    let ret = new Retorno();
    if(lOSAberto) {
        ret.code = 500;
        ret.data = "OS Aberta";
        ret.type = "Error";
        ret.message = "Já existe Ordem de Despejo cadastrada para essa OP!";
    } else {
        if(listaSD4.length === 0) {
            ret.code = 500;
            ret.data = "Sem empenho";
            ret.type = "No data";
            ret.message = "Não foram encontrados lotes disponíveis nos empenhos para atender essa OP!";
        } else {
            //Inserindo o cabeçalho
            chvOS = await checkExistOS("");
            wmsOS.motCod = "";
            wmsOS.oSBlocoSuger = "";
            wmsOS.oSData = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            wmsOS.oSHora = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
            wmsOS.oSOpTck = params.op;
            wmsOS.oSPrioridade = "0";
            wmsOS.oSID = chvOS.toString();
            wmsOS.oSStatus = "AT";
            ret = await setInsWMSOS(wmsOS);

            //Inserindo os itens
            //Buscando o endereço de cada lote da OP
            for(let i = 0; i < listaSD4.length; i++) {
                //Verificando a quantidade do empenho e selecionado os lotes
                nQtdEmpenho = Number(listaSD4[i].qtdori);
                //Selecionando os bags e quantidade para serem inseridas nas ordens de despejo
                //Verificando os bags disponíveis em estoque para evitar ás OSs
                const result = await getListaBagSD4(listaSD4[i].lote);
                let listBag: WMS_BagDTO[] = typeof result === 'string' ? [] : result;
                nSomaBag = 0;
                nQtdBag = 0;
                lContinua = true;
                for(let b = 0; listBag.length; b++) {
                    nQtdBag = Number(listBag[b]?.bagKgAtu);
                    nSomaBag += nQtdBag;
                    if(lContinua) {
                        const wmsItem = new WMS_ItemOSDTO();
                        wmsItem.empiCod = params.empiCod;
                        wmsItem.motCod = "";
                        wmsItem.itOSData = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                        wmsItem.itOSHora = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
                        wmsItem.itOsPesoSoltar = Number(nQtdBag).toFixed(2);

                        if(Number(nSomaBag) <= Number(nQtdEmpenho)) { //Quantidade do empenho ainda superior a soma dos lotes encontrados, leva todo bag. Senão leva parte do bag apenas
                            wmsItem.lote = listBag[b]?.bagLote.trim() || "";
                            wmsItem.itOsTagBag = listBag[b]?.bagTag.trim() || "";
                            enderOrigem = await getEndereco(listBag[b]!.bagAtuEnder.trim());
                            wmsItem.itOsOrigem = listBag[b]?.bagAtuEnder.trim() || "";
                            wmsItem.itOsPeso = listBag[b]?.bagKgAtu.toString() || "";
                            wmsItem.itOsObs = "";
                        } else {
                            //Alcançou a quantidade do empenho, lança somente a quantidade faltante (parte)
                            nQtdParte = nSomaBag - nQtdEmpenho;
                            wmsItem.lote = listBag[b]?.bagLote.trim() || "";
                            wmsItem.itOsTagBag = listBag[b]?.bagTag.trim() || "";
                            enderOrigem = await getEndereco(listBag[b]!.bagAtuEnder.trim());
                            wmsItem.itOsOrigem = listBag[b]?.bagAtuEnder.trim() || "";
                            wmsItem.itOsTagOrigem = enderOrigem.enderTag;
                            wmsItem.itOsPeso = Number(nQtdBag - nQtdParte).toFixed(2);
                            wmsItem.itOsObs = "*** PARTE ***" + " (" + Number(nQtdBag-nQtdParte).toFixed(2) + " kg)";
                            wmsItem.itOsPesoSoltar = Number(nQtdParte).toFixed(2);
                            lContinua = false;
                        }
                    //Verificando a quantidade de moegas enviadas no parametro, pode ser mais de uma moega para despejo
                    if(params.listaEnder.length === 1) {
                        wmsItem.itOsDestino = params.listaEnder[0].enderCod;
                        enderDestino = await getEndereco(params.listaEnder[0].enderCod);
                        wmsItem.itOsTagDestino = enderDestino.enderTag;
                    } else {
                        wmsItem.itOsDestino = "MOEGAS";
                        wmsItem.itOsTagDestino = "";
                        //Inserindo as moegas na tabela WMS_OPMoega
                        for(let m = 0; m < params.listaEnder.length; m++){
                            enderDestino = await getEndereco(params.listaEnder[m].enderCod);
                            insWMS_OPMoega(params.op, enderDestino.enderCod, enderDestino.enderTag);
                        }
                    }
                    wmsItem.itOSStatus = "AB";
                    wmsItem.itOsLibEnder = "";
                    chvItemOS = await getMaxItemOS(chvOS.toString());
                    wmsItem.oSID = chvOS.toString();
                    wmsItem.itOSItem = chvItemOS.toString();
                    //setInsWMS
                    }
                }
            }
        }
    }
    try {
        
    } catch (error) {
        
    }
}