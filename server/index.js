import express from "express";

const app = express();
const port = 3000;

// global middlewares
import configureCORS from "#/middlewares/cors.js";

app.use(express.json());

configureCORS(app);

// routes
import ticketRouter from "#/routes/tickets.js";
import serviceRouter from "#/routes/services.js";

const BASE_URL = "/api/v1";

app.use(`${BASE_URL}/tickets`, ticketRouter);
app.use(`${BASE_URL}/services`, serviceRouter);

// start server
app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`),
);
