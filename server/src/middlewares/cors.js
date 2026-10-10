import cors from "cors";

export default function configureCORS(app) {
  const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
  };

  app.use(cors(corsOptions));
}
