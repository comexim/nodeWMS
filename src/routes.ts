import { alteraPesoZ71Routes } from "./routes/alteraPesoZ71Routes"
import { delOpSeqRoutes } from "./routes/delOpSeqRoutes"
import { delZ71Routes } from "./routes/delZ71Routes"
import { getApImasRoutes } from "./routes/getApImasRoutes"
import { getBagRoutes } from "./routes/getBagRoutes"
import { getLancz71Routes } from "./routes/getLancz71Routes"
import { getLote05Routes } from "./routes/getLote05Routes"
import { getLoteApontRoutes } from "./routes/getLoteApontRoutes"
import { MovEnderRoutes } from "./routes/getMovEnderRoutes"
import { getOpAbertoRoutes } from "./routes/getOpAbertoRoutes"
import { getOpRoutes } from "./routes/getOpRoutes"
import { getOPSeqRoutes } from "./routes/getOPSeqRoutes"
import { getTokenRoutes } from "./routes/getTokenRoutes"
import { getZ71ProdRoutes } from "./routes/getZ71ProdRoutes"
import { setApImasRoutes } from "./routes/setApImasRoutes"
import { setOpSeqRoutes } from "./routes/setOpSeqRoutes"
import { z71Routes } from "./routes/setZ71Routes"
import { updOpSeqRoutes } from "./routes/updOpSeqRoutes"
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
}