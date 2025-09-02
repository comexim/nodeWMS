import Z71DTO from "../models/Z71DTO";
import Retorno from "../models/Retorno";
import { buscaProxLoteZ71, buscaRecnoZ71, buscaSEQZ71, checkExistOS, executeQuery, existWMSBag, getBag, getEnderDisp, getEndereco, getMaxItemOS, getMaxMovEnderID, getTag, insWMSBag, setStatusOPSeq, setWMSItemOS, setWMSOS, updWMSBag } from "../utils/dbExecute";
import WMS_EnderecoDTO from "../models/WMS_EnderecoDTO";
import WMS_ItemOSDTO from "../models/WMS_ItemOSDTO";
import WMS_OSDTO from "../models/WMS_OSDTO";
import WMS_BagDTO from "../models/WMS_BagDTO";

export async function setZ71(dados: Z71DTO): Promise<Retorno> {
        try {
            console.log("🚀 Iniciando setZ71 com dados:", dados);
            
            let chvOS = await checkExistOS(dados.op);
            console.log("✅ checkExistOS resultado:", chvOS);
            
            const chvItemOs = await getMaxItemOS(chvOS.toString());
            console.log("✅ getMaxItemOS resultado:", chvItemOs);
            
            const enderOrigem = await getTag(dados.setor, "E");
            console.log("✅ getTag (enderOrigem) resultado:", enderOrigem);
            
            const dadosEnderOri = await getEndereco(dados.setor);
            console.log("✅ getEndereco resultado:", dadosEnderOri);
            
            let enderDestino: WMS_EnderecoDTO | undefined = new WMS_EnderecoDTO();

            let bag = new WMS_BagDTO();
            let ender = new WMS_EnderecoDTO();

            if (dados.opTck === 'O') {
                console.log("🔍 Buscando endereço disponível para opTck 'O'");
                enderDestino = await getEnderDisp(dados.lote, dadosEnderOri.enderBloco, "", "");
                console.log("✅ getEnderDisp resultado:", enderDestino);
            }

            if (!enderDestino) {
                console.log("❌ Endereço não encontrado!");
                return new Retorno ({ code: 500, type: "Error", message: "Endereço não encontrado!"});
            }

            if (enderDestino.enderCod === null && dados.setor !== "DESCARGA") {
                console.log("🔍 Buscando endereço disponível (enderCod null)");
                enderDestino = await getEnderDisp(dados.lote,dadosEnderOri.enderBloco, "", "");
                console.log("✅ getEnderDisp (segunda busca) resultado:", enderDestino);
            }

            let sql = ""
            const loteObj = dados.lote;
            const pesoObj = dados.peso;
            const approdObj = dados.approd;
            const recObj = dados.rec;
            let tipoSql = "";
            let mensagem = "";

            let recno = dados.rec;
            let Novorecno = 0;

            if(recno == 0){
                console.log("📝 Preparando INSERT (recno = 0)");
                Novorecno = await buscaRecnoZ71();
                console.log("✅ buscaRecnoZ71 resultado:", Novorecno);
                
                tipoSql = "INS";
                sql = "INSERT INTO Z71010 (Z71_FILIAL, Z71_DATA, Z71_HORA, Z71_OP, Z71_LOTECT, Z71_PESO, Z71_APPROD, Z71_SETOR, Z71_SEQLOT, Z71_TAGRF, Z71_EMBAL, Z71_VOLS, R_E_C_N_O_, Z71_STATUS, Z71_HISTCHV, Z71_LINCAF, Z71_OPTCK, Z71_SEQOPID) VALUES (@filial, @data, @hora, @op, @lote, @peso, @approd, @setor, @seqlot, @tag, @embal, @vols, @recno, @status, @chvSeq, @linha, @opTck, @seqOpId)";
                
                //Adicionando os sequenciais caso o lote seja BC
                if(dados.setor === "DESCARGA") {
                    console.log("🔄 Processando setor DESCARGA");
                    if(loteObj.indexOf("/") < 0) {
                        if(dados.lote.length < 13) {
                            console.log("🔍 Buscando próximo lote para BC");
                            const proxLote = await buscaProxLoteZ71(loteObj);
                            console.log("✅ buscaProxLoteZ71 resultado:", proxLote);
                            dados.lote = loteObj + proxLote;
                            console.log("📝 Novo lote gerado:", dados.lote);
                        }
                    }
                }
            }else {
                console.log("📝 Preparando UPDATE (recno > 0)");
                tipoSql = "UPD";
                sql = "UPDATE Z71010 SET Z71_PESO = @pesoObj, Z71_APPROD = @approdObj WHERE R_E_C_N_O_ = @recObj";
            }
            
            console.log("🔢 Obtendo MaxMovEnderID");
            const maxChv = await getMaxMovEnderID();
            console.log("✅ getMaxMovEnderID resultado:", maxChv);
            
            let sqlInsMovEnder = `INSERT INTO WMS_MovEnder 
                                    (MovEnderID, OSID, ItOSItem, BagLote, 
                                    EnderTag, EnderCod, BagTag, EmpiCod, MotCod, MovEnderData,
                                    MovEnderHora, MovEnderSeq, MovEnderTipo, MovEnderPeso, 
                                    MovEnderPesoSoltar)
                                    VALUES (@maxChv, 0, 0, @lote, @enderTag, @enderCod, @tag, 'BAL', @motCod, @data, @hora, @nQtdIns, 'EMB', @peso, 0)`

            const params = {
                maxChv,
                lote: dados.lote.trim(),
                enderTag: enderDestino?.enderTag || '',
                enderCod: enderDestino?.enderCod || '',
                tag: dados.tag || '',
                motCod: dados.usuCod || 'DEFAULT', // Garantir que não seja NULL
                data: dados.data || '',
                hora: dados.hora || '',
                nQtdIns: dados.nQtdIns || 0,
                peso: dados.peso || 0
            };

            console.log("📝 Executando INSERT WMS_MovEnder com parâmetros:", params);
            await executeQuery(sqlInsMovEnder, params);
            console.log("✅ INSERT WMS_MovEnder executado com sucesso");
            
            let lSeq = 0; // Declarar fora do try para usar no retorno de sucesso
            console.log("🔍 Buscando SEQ Z71");
            lSeq = await buscaSEQZ71(dados.op,dados.lote.trim(),dados.data,dados.opTck);
            console.log("✅ buscaSEQZ71 resultado:", lSeq);

            if(tipoSql === "INS") {
                console.log("📝 Executando fluxo de INSERT");
                const insertParams = {
                    filial: dados.filial,
                    data: dados.data,
                    hora: dados.hora,
                    op: dados.op,
                    lote: dados.lote,
                    peso: dados.peso,
                    approd: dados.approd,
                    setor: dados.setor,
                    seqlot: lSeq,
                    tag: dados.tag,
                    embal: dados.embal,
                    vols: dados.vols,
                    recno: Novorecno, // Mantendo como número
                    status: "L",
                    chvSeq: dados.chvSeq,
                    linha: dados.linha,
                    opTck: dados.opTck,
                    seqOpId: dados.seqOpId == null ? 0 : dados.seqOpId
                };

                console.log("Parâmetros INSERT:", {
                    ...insertParams,
                    tipos: {
                        filial: typeof insertParams.filial,
                        peso: typeof insertParams.peso,
                        seqlot: typeof insertParams.seqlot,
                        recno: typeof insertParams.recno,
                        seqOpId: typeof insertParams.seqOpId
                    }
                });

                const wmsOS = new WMS_OSDTO( {
                    motCod: "",
                    oSBlocoSuger: "",
                    oSData: dados.data,
                    oSHora: dados.hora,
                    oSOpTck: dados.op,
                    oSPrioridade: "0",
                    oSID: ""
                });

                const wmsItem = new WMS_ItemOSDTO({
                    empiCod: "",
                    motCod: "",
                    itOSData: dados.data,
                    itOSHora: dados.hora,
                    lote: dados.lote.trim(),
                    itOsTagBag: dados.tag,
                    itOsOrigem: dados.setor,
                    itOsTagOrigem: enderOrigem?.tagID || "",
                    itOsDestino: enderDestino?.enderCod || "",
                    itOsTagDestino: enderDestino?.enderTag || "",
                    itOSStatus: "AB",
                    oSID: "",
                    itOSItem: ""
                });

                console.log("🏗️ WMS_OSDTO criado:", wmsOS);
                console.log("🏗️ WMS_ItemOSDTO criado:", wmsItem);

                if(enderOrigem.tipo?.trim().length==0) {
                    console.log("❌ Endereço de Origem inválido");
                    return new Retorno({code: 400, message: "Endereço de Origem inválido, verifique!"})
                }else{
                    console.log("✅ Endereço de origem válido, tipo:", enderOrigem?.tipo);
                    if(enderOrigem?.tipo === "EMBEG") {
                        console.log("🎯 Processando tipo EMBEG");
                        if (dados.tag && dados.tag.length > 0) {
                            console.log("🔍 Buscando bag:", dados.tag);
                            bag = await getBag(dados.tag);
                            console.log("✅ getBag resultado:", bag);
                            
                            if(bag.bagStatus === "LV") {
                                console.log("✅ Bag status LV - processando OS");
                                if (chvOS > 0) {
                                    console.log("📝 Usando OS existente:", chvOS);
                                    wmsItem.oSID = chvOS.toString();
                                    wmsItem.itOSItem = chvItemOs.toString();
                                    await setWMSItemOS(wmsItem);
                                    console.log("✅ setWMSItemOS executado");
                                } else {
                                    console.log("📝 Criando nova OS");
                                    chvOS = await checkExistOS("");
                                    console.log("✅ Nova chvOS:", chvOS);
                                    
                                    wmsOS.oSID = chvOS.toString();
                                    await setWMSOS(wmsOS);
                                    console.log("✅ setWMSOS executado");
                                    
                                    wmsItem.oSID = chvOS.toString();
                                    wmsItem.itOSItem = chvItemOs.toString();

                                    await setWMSItemOS(wmsItem);
                                    console.log("✅ setWMSItemOS executado");
                                }
                            }

                            console.log("🔍 Verificando existência do bag");
                            const bagExists = await existWMSBag(dados.tag, "");
                            console.log("✅ existWMSBag resultado:", bagExists);
                            
                            if(!bagExists) {
                                console.log("📝 Inserindo novo bag");
                                await insWMSBag(dados.tag, dados.lote, "EMB", dados.setor, "", dados.peso);
                                console.log("✅ insWMSBag executado");
                            } else {
                                console.log("📝 Atualizando bag existente");
                                await updWMSBag(dados.tag, dados.lote, "EMB", dados.setor, "", dados.peso);
                                console.log("✅ updWMSBag executado");
                            }
                        }else {
                            console.log("❌ ID do bag não preenchido");
                            mensagem = "ID do bag não preenchido, verifique!";
                        }
                        
                        //Setando o seqOp para iniciado
                        console.log("📝 Atualizando status OP para iniciado");
                        await setStatusOPSeq(dados.seqOpId, "I");
                        console.log("✅ setStatusOPSeq executado");
                    }
                }

                
                //No balão enviar a quantidade de insert = 0
                //Verificando a quantidade de inserts que serão dados
                console.log("📊 Verificando quantidade de inserts:", dados.nQtdIns);
                if (dados.nQtdIns != null) {
                    if(dados.nQtdIns > 0) {
                        console.log("🔄 Executando múltiplos inserts:", dados.nQtdIns);
                        for(let i = 0; i < dados.nQtdIns; i++) {
                            console.log(`📝 Insert ${i + 1}/${dados.nQtdIns}`);
                            const Novorecno = await buscaRecnoZ71();
                            console.log("✅ Novo recno obtido:", Novorecno);
                            
                            dados.seq = i + 1;

                            // Atualizar propriedades específicas para cada iteração
                            insertParams.seqlot = dados.seq;
                            insertParams.recno = Novorecno; // Mantendo como número

                            await executeQuery(sql, insertParams);
                            console.log(`✅ Insert ${i + 1} executado com sucesso`);
                        }
                    } else {
                        console.log("📝 Executando insert único");
                        await executeQuery(sql, insertParams);
                        console.log("✅ Insert único executado com sucesso");
                    }
                }
            } else {
                console.log("📝 Executando fluxo de UPDATE");
                const updateParams = {
                    pesoObj: pesoObj,
                    approdObj: approdObj,
                    recObj: recObj
                };
                
                console.log("Parâmetros UPDATE:", {
                    ...updateParams,
                    tipos: {
                        pesoObj: typeof updateParams.pesoObj,
                        approdObj: typeof updateParams.approdObj,
                        recObj: typeof updateParams.recObj
                    }
                });
                
                await executeQuery(sql, updateParams);
                console.log("✅ UPDATE executado com sucesso");
            }

            // Se chegou até aqui, é sucesso
            console.log("🎉 setZ71 finalizado com sucesso!");
            return new Retorno({
                code: 600,
                type: "OK", 
                message: "Dado gravado com sucesso",
                data: lSeq.toString(),
                recno: "",
                retorno: ""
            });

        } catch (error: any) {
            console.log("❌ Erro capturado em setZ71:", error);
            console.log("📋 Stack trace:", error?.stack);
            
            const errorMessage = error?.message || "";
            const stackTrace = error?.stack || "";
            let apiError = "API desconhecida";
            let mensagem = "";
            
            // Análise mais específica do erro
            if (!errorMessage.includes("conversion") || errorMessage.includes("converting")) {
                apiError = "executeQuery - Erro de conversão de tipos";
            } else if (stackTrace.includes("checkExistOS") || errorMessage.includes("checkExistOS")) {
                apiError = "checkExistOS";
            } else if (stackTrace.includes("getMaxItemOS") || errorMessage.includes("getMaxItemOS")) {
                apiError = "getMaxItemOS";
            } else if (stackTrace.includes("getTag") || errorMessage.includes("getTag")) {
                apiError = "getTag";
            } else if (stackTrace.includes("getEndereco") || errorMessage.includes("getEndereco")) {
                apiError = "getEndereco";
            } else if (stackTrace.includes("getEnderDisp") || errorMessage.includes("getEnderDisp")) {
                apiError = "getEnderDisp";
            } else if (stackTrace.includes("buscaRecnoZ71") || errorMessage.includes("buscaRecnoZ71")) {
                apiError = "buscaRecnoZ71";
            } else if (stackTrace.includes("buscaProxLoteZ71") || errorMessage.includes("buscaProxLoteZ71")) {
                apiError = "buscaProxLoteZ71";
            } else if (stackTrace.includes("buscaSEQZ71") || errorMessage.includes("buscaSEQZ71")) {
                apiError = "buscaSEQZ71";
            } else if (stackTrace.includes("setWMSItemOS") || errorMessage.includes("setWMSItemOS")) {
                apiError = "setWMSItemOS";
            } else if (stackTrace.includes("setWMSOS") || errorMessage.includes("setWMSOS")) {
                apiError = "setWMSOS";
            } else if (stackTrace.includes("existWMSBag") || errorMessage.includes("existWMSBag")) {
                apiError = "existWMSBag";
            } else if (stackTrace.includes("insWMSBag") || errorMessage.includes("insWMSBag")) {
                apiError = "insWMSBag";
            } else if (stackTrace.includes("updWMSBag") || errorMessage.includes("updWMSBag")) {
                apiError = "updWMSBag";
            } else if (stackTrace.includes("setStatusOPSeq") || errorMessage.includes("setStatusOPSeq")) {
                apiError = "setStatusOPSeq";
            } else if (stackTrace.includes("executeQuery") || errorMessage.includes("executeQuery")) {
                apiError = "executeQuery";
            }
            
            console.log("🏷️ API onde ocorreu o erro:", apiError);
            console.log("💬 Mensagem de erro:", errorMessage);
            
            return new Retorno({
                code: 500,
                type: "Error",
                message: mensagem || errorMessage || "Erro interno do servidor",
                data: "",
                recno: apiError,
                retorno: errorMessage
            });
        }
}