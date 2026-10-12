import cors from "cors";

/**
 * @param {import("express-serve-static-core").Express} app
 */
export default function configureCORS(app) {
  const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
  };

  app.use(cors(corsOptions));
}
