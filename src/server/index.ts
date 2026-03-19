import { Hono } from "hono";
import { rpcApp } from "./routes/rpc";
import { clientEntry } from "./routes/client-entry";

const app = new Hono();

app.get("/", (c) => c.redirect("/forum"));
app.route("/rpc", rpcApp);
app.get("/*", clientEntry);

export default app;
