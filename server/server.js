import app from "./src/app.js";
import env from "./src/config/env.js";

app.listen(env.port, () => {
  console.log(`Sangam API running on port ${env.port} [${env.nodeEnv}]`);
});