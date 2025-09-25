import { alteraPesoZ71Routes } from "./routes/automacao/alteraPesoZ71Routes"
import { delEtiquetaRoutes } from "./routes/automacao/delEtiquetaRoutes"
import { delOpSeqRoutes } from "./routes/automacao/delOpSeqRoutes"
import { delZ71Routes } from "./routes/automacao/delZ71Routes"
import { getApImasRoutes } from "./routes/automacao/getApImasRoutes"
import { getBagRoutes } from "./routes/automacao/getBagRoutes"
import { getLancz71Routes } from "./routes/automacao/getLancz71Routes"
import { getLote05Routes } from "./routes/automacao/getLote05Routes"
import { getLoteApontRoutes } from "./routes/automacao/getLoteApontRoutes"
import { MovEnderRoutes } from "./routes/automacao/getMovEnderRoutes"
import { getOpAbertoRoutes } from "./routes/automacao/getOpAbertoRoutes"
import { getOpRoutes } from "./routes/automacao/getOpRoutes"
import { getOPSeqRoutes } from "./routes/automacao/getOPSeqRoutes"
import { getTokenRoutes } from "./routes/automacao/getTokenRoutes"
import { getZ71ProdRoutes } from "./routes/automacao/getZ71ProdRoutes"
import { setApImasRoutes } from "./routes/automacao/setApImasRoutes"
import { setOpSeqRoutes } from "./routes/automacao/setOpSeqRoutes"
import { z71Routes } from "./routes/automacao/setZ71Routes"
import { updOpSeqRoutes } from "./routes/automacao/updOpSeqRoutes"
//======================================================================
import { getTokenProtheusRoutes } from "./routes/protheus/getTokenProtheusRoutes"
import { getContasPagasProtheusRoutes } from "./routes/protheus/getContasPagasProtheusRoutes"

import { app } from "./server"

export const routes = async () => {
    app.register(z71Routes);
    app.register(getTokenRoutes);
    app.register(MovEnderRoutes);
    app.register(getLancz71Routes);
    app.register(alteraPesoZ71Routes);
    app.register(delZ71Routes);
    app.register(getBagRoutes);
    app.register(getOpRoutes);
    app.register(getOPSeqRoutes);
    app.register(delOpSeqRoutes);
    app.register(updOpSeqRoutes);
    app.register(setOpSeqRoutes);
    app.register(getOpAbertoRoutes);
    app.register(getZ71ProdRoutes);
    app.register(setApImasRoutes);
    app.register(getApImasRoutes);
    app.register(getLoteApontRoutes);
    app.register(getLote05Routes);
    app.register(delEtiquetaRoutes);
//======================================
    app.register(getTokenProtheusRoutes);
    app.register(getContasPagasProtheusRoutes);
}