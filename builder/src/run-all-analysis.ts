import {generateAnalytics} from "./generate-inventory-stats.js";

await generateAnalytics().catch(console.error);