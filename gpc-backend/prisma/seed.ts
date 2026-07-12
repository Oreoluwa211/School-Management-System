import { PrismaClient, ClassLevel, SubjectLevel, TermName, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function parseClassCode(code: string) {
  // e.g. "JSS1A" -> { name: "JSS 1", arm: "A", level: "JSS" }
  const match = code.match(/^([A-Z]+)(\d)([A-Z])$/);
  if (!match) throw new Error(`Invalid class code: ${code}`);
  const [, levelPrefix, num, arm] = match;
  return {
    name: `${levelPrefix} ${num}`,
    arm,
    level: levelPrefix as ClassLevel,
  };
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Academic Session ──
  const session = await prisma.academicSession.upsert({
    where: { name: "2024/2025" },
    update: {},
    create: {
      name: "2024/2025",
      is_current: true,
      start_date: new Date("2024-09-09"),
      end_date: new Date("2025-07-25"),
    },
  });

  // ── Terms ──
  const termData = [
    { name: TermName.FIRST_TERM, is_current: false, start_date: new Date("2024-09-09"), end_date: new Date("2024-12-13"), result_deadline: new Date("2024-12-10") },
    { name: TermName.SECOND_TERM, is_current: true, start_date: new Date("2025-01-06"), end_date: new Date("2025-04-04"), result_deadline: new Date("2025-05-08") },
    { name: TermName.THIRD_TERM, is_current: false, start_date: new Date("2025-04-22"), end_date: new Date("2025-07-25"), result_deadline: new Date("2025-07-18") },
  ];

  for (const term of termData) {
    const existing = await prisma.term.findFirst({ where: { session_id: session.id, name: term.name } });
    if (!existing) {
      await prisma.term.create({ data: { ...term, session_id: session.id } });
    }
  }

  const currentTerm = await prisma.term.findFirst({ where: { session_id: session.id, is_current: true } });
  console.log(`✓ Session 2024/2025 with 3 terms (current: ${currentTerm?.name})`);

  // ── Classes ──
  const classCodes = ["JSS1A", "JSS1B", "JSS2A", "JSS2B", "JSS3A", "JSS3B", "SS1A", "SS1B", "SS2A", "SS2B", "SS3A"];
  const classMap: Record<string, string> = {};

  for (const code of classCodes) {
    const { name, arm, level } = parseClassCode(code);
    const cls = await prisma.class.upsert({
      where: { name_arm: { name, arm } },
      update: {},
      create: { name, arm, level },
    });
    classMap[code] = cls.id;
  }
  console.log(`✓ ${classCodes.length} classes created`);

  // ── Subjects ──
  const subjects: { name: string; level: SubjectLevel }[] = [
    { name: "Mathematics", level: SubjectLevel.ALL },
    { name: "English Language", level: SubjectLevel.ALL },
    { name: "Basic Science", level: SubjectLevel.JSS },
    { name: "Social Studies", level: SubjectLevel.JSS },
    { name: "Basic Technology", level: SubjectLevel.JSS },
    { name: "Home Economics", level: SubjectLevel.JSS },
    { name: "Agric Science", level: SubjectLevel.JSS },
    { name: "Civic Education", level: SubjectLevel.JSS },
    { name: "CRS/Islamic Studies", level: SubjectLevel.ALL },
    { name: "ICT", level: SubjectLevel.ALL },
    { name: "Business Studies", level: SubjectLevel.JSS },
    { name: "Yoruba Language", level: SubjectLevel.ALL },
    { name: "Physics", level: SubjectLevel.SS },
    { name: "Chemistry", level: SubjectLevel.SS },
    { name: "Biology", level: SubjectLevel.SS },
    { name: "Economics", level: SubjectLevel.SS },
    { name: "Government", level: SubjectLevel.SS },
    { name: "Literature in English", level: SubjectLevel.SS },
    { name: "Geography", level: SubjectLevel.SS },
  ];

  const subjectMap: Record<string, string> = {};
  for (const subj of subjects) {
    const created = await prisma.subject.upsert({
      where: { name: subj.name },
      update: {},
      create: subj,
    });
    subjectMap[subj.name] = created.id;
  }
  console.log(`✓ ${subjects.length} subjects created`);

  // ── Super Admin ──
  const adminPasswordHash = await bcrypt.hash("Admin@GPC2025", 10);
  await prisma.user.upsert({
    where: { email: "admin@goodnewscollege.edu.ng" },
    update: {},
    create: {
      email: "admin@goodnewscollege.edu.ng",
      password_hash: adminPasswordHash,
      role: Role.super_admin,
    },
  });
  console.log("✓ Super admin created (admin@goodnewscollege.edu.ng)");

  // ── Staff: HOD Mathematics, class teacher JSS1A ──
  const staffPasswordHash = await bcrypt.hash("Staff@GPC2025", 10);
  const staffUser = await prisma.user.upsert({
    where: { email: "e.adeyemi@goodnewscollege.edu.ng" },
    update: {},
    create: {
      email: "e.adeyemi@goodnewscollege.edu.ng",
      password_hash: staffPasswordHash,
      role: Role.staff,
    },
  });

  const staff = await prisma.staff.upsert({
    where: { user_id: staffUser.id },
    update: {},
    create: {
      user_id: staffUser.id,
      staff_id: "GPC/STF/0001",
      first_name: "Emmanuel",
      last_name: "Adeyemi",
      email: "e.adeyemi@goodnewscollege.edu.ng",
      designation: "HOD Mathematics",
      department: "Mathematics",
      is_class_teacher: true,
      class_id: classMap["JSS1A"],
      date_employed: new Date("2015-09-01"),
    },
  });

  // Assign Mathematics for JSS1A this session
  await prisma.staffSubjectAssignment.upsert({
    where: {
      staff_id_subject_id_class_id_session_id: {
        staff_id: staff.id,
        subject_id: subjectMap["Mathematics"],
        class_id: classMap["JSS1A"],
        session_id: session.id,
      },
    },
    update: {},
    create: {
      staff_id: staff.id,
      subject_id: subjectMap["Mathematics"],
      class_id: classMap["JSS1A"],
      session_id: session.id,
    },
  });
  console.log("✓ Staff created — Emmanuel Adeyemi (HOD Mathematics, JSS1A class teacher)");

  // ── Student: Chidera Okafor, JSS1A ──
  const studentPasswordHash = await bcrypt.hash("Student@GPC2025", 10);
  const studentUser = await prisma.user.upsert({
    where: { email: "c.okafor@students.goodnewscollege.edu.ng" },
    update: {},
    create: {
      email: "c.okafor@students.goodnewscollege.edu.ng",
      password_hash: studentPasswordHash,
      role: Role.student,
    },
  });

  await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      user_id: studentUser.id,
      student_id: "GPC/2025/00001",
      first_name: "Chidera",
      last_name: "Okafor",
      email: "c.okafor@students.goodnewscollege.edu.ng",
      class_id: classMap["JSS1A"],
      session_id: session.id,
      status: "active",
    },
  });
  console.log("✓ Student created — Chidera Okafor (JSS1A)");

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("Demo accounts:");
  console.log("  Super Admin: admin@goodnewscollege.edu.ng / Admin@GPC2025");
  console.log("  Staff:       e.adeyemi@goodnewscollege.edu.ng / Staff@GPC2025");
  console.log("  Student:     c.okafor@students.goodnewscollege.edu.ng / Student@GPC2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });