"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const birthday_cron_1 = require("./jobs/birthday.cron");
const PORT = Number(env_1.env.PORT);
app_1.default.listen(PORT, () => {
    console.log(`🚀 GPC API server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Environment: ${env_1.env.NODE_ENV}`);
    // Start scheduled jobs
    (0, birthday_cron_1.startBirthdayCron)();
});
