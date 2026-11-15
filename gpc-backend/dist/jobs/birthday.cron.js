"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBirthdayCron = startBirthdayCron;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
async function postBirthdayNotices() {
    const today = new Date();
    const month = today.getMonth() + 1; // 1-indexed
    const day = today.getDate();
    console.log(`🎂 [Birthday Cron] Running for ${day}/${month}...`);
    // Find students with birthday today
    const students = await prisma_1.prisma.student.findMany({
        where: { status: "active" },
        include: { class: true },
    });
    const birthdayStudents = students.filter((s) => {
        if (!s.date_of_birth)
            return false;
        const dob = new Date(s.date_of_birth);
        return dob.getMonth() + 1 === month && dob.getDate() === day;
    });
    // Find staff with birthday today
    const staffList = await prisma_1.prisma.staff.findMany({});
    const birthdayStaff = staffList.filter((s) => {
        if (!s.date_of_birth)
            return false;
        const dob = new Date(s.date_of_birth);
        return dob.getMonth() + 1 === month && dob.getDate() === day;
    });
    // Get the admin user to attribute notices to
    const adminUser = await prisma_1.prisma.user.findFirst({
        where: { role: "super_admin" },
    });
    if (!adminUser) {
        console.log("[Birthday Cron] No admin user found — skipping.");
        return;
    }
    // Post student birthday notices
    for (const student of birthdayStudents) {
        const message = `🎂 Happy Birthday, ${student.first_name} ${student.last_name} (${student.class?.name} ${student.class?.arm})! Wishing you joy and blessings today!`;
        await prisma_1.prisma.notice.create({
            data: {
                title: `Happy Birthday, ${student.first_name}! 🎉`,
                content: message,
                category: "birthday",
                audience: "all",
                is_active: true,
                created_by: adminUser.id,
            },
        });
        console.log(`[Birthday Cron] ✓ Student notice posted: ${student.first_name} ${student.last_name}`);
    }
    // Post staff birthday notices
    for (const staff of birthdayStaff) {
        const message = `🎂 Happy Birthday, ${staff.first_name} ${staff.last_name} (${staff.department || "Staff"})! Wishing you joy and blessings today!`;
        await prisma_1.prisma.notice.create({
            data: {
                title: `Happy Birthday, ${staff.first_name}! 🎉`,
                content: message,
                category: "birthday",
                audience: "staff",
                is_active: true,
                created_by: adminUser.id,
            },
        });
        console.log(`[Birthday Cron] ✓ Staff notice posted: ${staff.first_name} ${staff.last_name}`);
    }
    const total = birthdayStudents.length + birthdayStaff.length;
    console.log(`[Birthday Cron] Done — ${total} birthday notice(s) posted.`);
}
function startBirthdayCron() {
    // Runs every day at 7:00 AM
    node_cron_1.default.schedule("0 7 * * *", async () => {
        try {
            await postBirthdayNotices();
        }
        catch (err) {
            console.error("[Birthday Cron] Error:", err);
        }
    }, {
        timezone: "Africa/Lagos",
    });
    console.log("🎂 Birthday cron job scheduled (daily at 7:00 AM WAT)");
}
