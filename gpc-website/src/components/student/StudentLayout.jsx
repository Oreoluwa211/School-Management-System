import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import api from "../../lib/api";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    api.get("/student-portal/dashboard").then(({ data }) => {
      setStudentName(`${data.student.first_name} ${data.student.last_name}`);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-[#f7f6f2] overflow-hidden">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <StudentTopbar
          onMenuClick={() => setSidebarOpen(true)}
          studentName={studentName}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}