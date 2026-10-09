import express from "express";

const app = express();
const port = 3000;

// global middlewares
import configureCORS from "#src/middlewares/cors.js";

app.use(express.json());

configureCORS(app);

// routes
import ticketRouter from "#src/routes/tickets.js";
import serviceRouter from "#src/routes/services.js";
import counterRouter from "#src/routes/counters.js";

const BASE_URL = "/api/v1";

app.use(`${BASE_URL}/tickets`, ticketRouter);
app.use(`${BASE_URL}/services`, serviceRouter);
app.use(`${BASE_URL}/counters`, counterRouter);

// error handling middleware
import errorHandler from "#src/middlewares/errorHandler.js";

app.use(errorHandler);

// start server
app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`),
);
