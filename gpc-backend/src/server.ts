import app from "./app";
import { env } from "./config/env";
import { startBirthdayCron } from "./jobs/birthday.cron";


const PORT = Number(env.PORT);

app.listen(PORT, () => {
  console.log(`🚀 GPC API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${env.NODE_ENV}`);

  // Start scheduled jobs
  startBirthdayCron();

});