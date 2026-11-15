"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
exports.reportCardHTML = reportCardHTML;
exports.acceptanceLetterHTML = acceptanceLetterHTML;
const puppeteer_1 = __importDefault(require("puppeteer"));
async function generatePDF(html) {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });
    await browser.close();
    return Buffer.from(pdf);
}
function reportCardHTML(data) {
    const { student, class: cls, term, session, results, reportCard, classTeacher } = data;
    const gradeColor = (grade) => {
        if (grade === "A")
            return "#16a34a";
        if (grade === "B")
            return "#2563eb";
        if (grade === "C")
            return "#0a1628";
        if (grade === "D")
            return "#d97706";
        return "#dc2626";
    };
    const rows = results.map((r) => `
    <tr>
      <td>${r.subject?.name || "—"}</td>
      <td class="center">${Number(r.ca_score)}</td>
      <td class="center">${Number(r.exam_score)}</td>
      <td class="center"><strong>${Number(r.total_score)}</strong></td>
      <td class="center" style="color:${gradeColor(r.grade)};font-weight:700">${r.grade || "—"}</td>
      <td>${r.remark || "—"}</td>
    </tr>
  `).join("");
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #0a1628; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px double #c9a84c; padding-bottom: 16px; margin-bottom: 20px; }
    .school-name { font-size: 22px; font-weight: 700; color: #0a1628; letter-spacing: 1px; }
    .school-sub { font-size: 11px; color: #666; margin-top: 2px; }
    .report-title { font-size: 16px; font-weight: 700; color: #c9a84c; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; font-size: 12px; }
    .info-row { display: flex; gap: 6px; }
    .info-label { color: #666; min-width: 110px; }
    .info-value { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0a1628; color: white; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #faf8f3; }
    .center { text-align: center; }
    .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center; }
    .summary-value { font-size: 20px; font-weight: 700; color: #0a1628; }
    .summary-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .remarks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .remark-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .remark-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #c9a84c; letter-spacing: 1px; margin-bottom: 6px; }
    .remark-text { font-size: 12px; color: #333; line-height: 1.5; }
    .signature-line { border-top: 1px solid #333; margin-top: 30px; padding-top: 4px; font-size: 10px; color: #666; }
    .footer { border-top: 2px solid #c9a84c; padding-top: 10px; margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
    .gold-bar { height: 4px; background: linear-gradient(90deg, #0a1628, #c9a84c, #0a1628); margin-bottom: 16px; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="gold-bar"></div>
  <div class="header">
    <div class="school-name">GOODNEWS PRIVATE COLLEGE</div>
    <div class="school-sub">Excellence · Faith · Integrity</div>
    <div class="school-sub">123 College Road, Ibadan, Oyo State · info@goodnewscollege.edu.ng</div>
    <div class="report-title">Student Report Card</div>
  </div>

  <div class="info-grid">
    <div>
      <div class="info-row"><span class="info-label">Student Name:</span><span class="info-value">${student.first_name} ${student.middle_name || ""} ${student.last_name}</span></div>
      <div class="info-row"><span class="info-label">Student ID:</span><span class="info-value">${student.student_id}</span></div>
      <div class="info-row"><span class="info-label">Class:</span><span class="info-value">${cls?.name} ${cls?.arm}</span></div>
      <div class="info-row"><span class="info-label">Class Teacher:</span><span class="info-value">${classTeacher || "—"}</span></div>
    </div>
    <div>
      <div class="info-row"><span class="info-label">Session:</span><span class="info-value">${session?.name}</span></div>
      <div class="info-row"><span class="info-label">Term:</span><span class="info-value">${term?.name?.replace("_", " ")}</span></div>
      <div class="info-row"><span class="info-label">Gender:</span><span class="info-value">${student.gender || "—"}</span></div>
      <div class="info-row"><span class="info-label">Date Printed:</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th class="center">CA (40)</th>
        <th class="center">Exam (60)</th>
        <th class="center">Total (100)</th>
        <th class="center">Grade</th>
        <th>Remark</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${reportCard ? `
  <div class="summary-box">
    <div class="summary-card">
      <div class="summary-value">${Number(reportCard.total_score).toFixed(0)}</div>
      <div class="summary-label">Total Score</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${Number(reportCard.average).toFixed(1)}</div>
      <div class="summary-label">Average</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${reportCard.position}<sup style="font-size:12px">${ordinal(reportCard.position)}</sup></div>
      <div class="summary-label">Position</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${reportCard.class_size}</div>
      <div class="summary-label">Class Size</div>
    </div>
  </div>

  <div class="remarks-grid">
    <div class="remark-box">
      <div class="remark-title">Class Teacher's Remark</div>
      <div class="remark-text">${reportCard.teacher_remark || "—"}</div>
      <div class="signature-line">Signature & Date</div>
    </div>
    <div class="remark-box">
      <div class="remark-title">Principal's Remark</div>
      <div class="remark-text">${reportCard.principal_remark || "—"}</div>
      <div class="signature-line">Signature & Date</div>
    </div>
  </div>
  ` : ""}

  <div class="footer">
    <p>Goodnews Private College · 123 College Road, Ibadan, Oyo State</p>
    <p>Tel: +234 800 000 0000 · www.goodnewscollege.edu.ng</p>
    <p style="margin-top:4px;color:#c9a84c;font-style:italic">Excellence · Faith · Integrity</p>
  </div>
  <div class="gold-bar" style="margin-top:16px"></div>
</body>
</html>`;
}
function acceptanceLetterHTML(data) {
    const { admission, session, classAllocated, resumptionDate } = data;
    const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
    });
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #0a1628; font-size: 13px; line-height: 1.7; }
    .gold-bar { height: 4px; background: linear-gradient(90deg, #0a1628, #c9a84c, #0a1628); border-radius: 2px; }
    .header { text-align: center; border-bottom: 2px solid #c9a84c; padding: 20px 0; margin-bottom: 30px; }
    .school-name { font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .school-sub { font-size: 11px; color: #666; margin-top: 3px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 12px; }
    .body-text { margin-bottom: 16px; }
    .highlight { font-weight: 700; color: #c9a84c; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 12px; }
    .info-table td:first-child { background: #faf8f3; font-weight: 600; width: 40%; }
    ul.items { margin: 12px 0 16px 24px; }
    ul.items li { margin-bottom: 4px; font-size: 12px; }
    .signature-section { margin-top: 40px; }
    .signature-line { border-top: 1px solid #333; width: 200px; margin-top: 50px; padding-top: 4px; font-size: 11px; color: #666; }
    .seal { border: 3px double #c9a84c; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8px; font-weight: 700; color: #c9a84c; float: right; margin-top: -60px; }
    .footer { border-top: 2px solid #c9a84c; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="gold-bar"></div>
  <div class="header">
    <div class="school-name">GOODNEWS PRIVATE COLLEGE</div>
    <div class="school-sub">Excellence · Faith · Integrity</div>
    <div class="school-sub">123 College Road, Ibadan, Oyo State · info@goodnewscollege.edu.ng</div>
  </div>

  <div class="meta">
    <div>
      <div><strong>Date:</strong> ${today}</div>
      <div><strong>Ref:</strong> GPC/ADM/${session?.name?.replace("/", "-")}/${admission.reference_number}</div>
    </div>
  </div>

  <div class="body-text">
    <strong>Dear Parent/Guardian of ${admission.first_name} ${admission.last_name},</strong>
  </div>

  <div class="body-text" style="text-align:center;font-size:16px;font-weight:700;color:#c9a84c;margin:20px 0;letter-spacing:1px">
    OFFER OF ADMISSION — ${session?.name} ACADEMIC SESSION
  </div>

  <div class="body-text">
    We are pleased to inform you that following a review of your ward's application, the Management of
    <strong>Goodnews Private College</strong> has approved the admission of
    <span class="highlight">${admission.first_name} ${admission.middle_name || ""} ${admission.last_name}</span>
    into our institution for the <span class="highlight">${session?.name}</span> academic session.
  </div>

  <table class="info-table">
    <tr><td>Student Name</td><td>${admission.first_name} ${admission.middle_name || ""} ${admission.last_name}</td></tr>
    <tr><td>Reference Number</td><td>${admission.reference_number}</td></tr>
    <tr><td>Class Allocated</td><td>${classAllocated || admission.class_applying_for}</td></tr>
    <tr><td>Boarding Type</td><td>${admission.boarding_type}</td></tr>
    <tr><td>Academic Session</td><td>${session?.name}</td></tr>
    ${resumptionDate ? `<tr><td>Resumption Date</td><td>${resumptionDate}</td></tr>` : ""}
    <tr><td>Parent/Guardian</td><td>${admission.father_name}</td></tr>
    <tr><td>Contact</td><td>${admission.father_email} / ${admission.father_phone}</td></tr>
  </table>

  <div class="body-text">
    Please note the following items to be brought on resumption day:
  </div>
  <ul class="items">
    <li>This acceptance letter (printed)</li>
    <li>Evidence of fee payment</li>
    <li>4 recent passport photographs</li>
    <li>Original birth certificate</li>
    <li>Medical fitness certificate</li>
    <li>Last school report card (original)</li>
    <li>Stationery and personal effects as applicable</li>
  </ul>

  <div class="body-text">
    We look forward to welcoming your ward to the GPC family. Please do not hesitate to contact our
    admissions office if you require any further information.
  </div>

  <div class="signature-section">
    <div class="body-text">Yours faithfully,</div>
    <div class="signature-line">
      Principal<br>Goodnews Private College
    </div>
    <div class="seal">OFFICIAL<br>SEAL<br>GPC</div>
  </div>

  <div class="footer">
    <p>Goodnews Private College · 123 College Road, Ibadan, Oyo State</p>
    <p>Tel: +234 800 000 0000 · www.goodnewscollege.edu.ng</p>
  </div>
  <div class="gold-bar" style="margin-top:16px"></div>
</body>
</html>`;
}
function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
