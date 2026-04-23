import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Cron Jobs 定义
 * EXPIRY-001: 每 24 小时检查过期批次
 *
 * 使用 crons.interval（禁止使用 crons.daily）
 * 调用 internal.batches.checkExpiry（internalMutation）
 */

const crons = cronJobs();

// 每 24 小时执行一次过期检查
crons.interval(
  "check expiry",
  { hours: 24 },
  internal.batches.checkExpiry,
);

export default crons;
