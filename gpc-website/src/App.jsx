import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StickyButtons from "./components/StickyButtons";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Apply from "./pages/Apply";
import TrackApplication from "./pages/TrackApplication";
import Login from "./pages/Login";
import Applications from "./pages/admin/Applications";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ComingSoon from "./pages/admin/ComingSoon";
import Students from "./pages/admin/Students";

import Staff from "./pages/admin/Staff";
import Notices from "./pages/admin/Notices";

import StaffLayout from "./components/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Attendance from "./pages/staff/Attendance";
import LessonNotes from "./pages/staff/LessonNotes";

import ResultEntry from "./pages/staff/ResultEntry";
import Timetable from "./pages/staff/Timetable"

import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyResults from "./pages/student/MyResults";
import MyAttendance from "./pages/student/MyAttendance";
import MyNotices from "./pages/student/MyNotices";
import ELibrary from "./pages/student/ELibrary";
import Fees from "./pages/student/Fees";

import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ServerError from "./pages/ServerError";

import Results from "./pages/admin/Results";
import Settings from "./pages/admin/Settings";
import Payments from "./pages/admin/Payments";

function PublicLayout({ children }) {
  return (
    <div className="font-sans">
      <Navbar />
      {children}
      <Footer />
      <StickyButtons />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/apply" element={<PublicLayout><Apply /></PublicLayout>} />
            <Route path="/track" element={<PublicLayout><TrackApplication /></PublicLayout>} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={["super_admin", "admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="applications" element={<Applications />} />
                <Route path="students" element={<Students />} />
                <Route path="staff" element={<Staff />} />
                <Route path="results" element={<Results />} />
                <Route path="notices" element={<Notices />} />
                <Route path="payments" element={<Payments />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Staff Portal */}
            <Route element={<ProtectedRoute allowedRoles={["staff", "super_admin", "admin"]} />}>
              <Route path="/staff" element={<StaffLayout />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="lesson-notes" element={<LessonNotes />} />
                <Route path="results" element={<ResultEntry />} />
                <Route path="timetable" element={<Timetable />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["student", "super_admin", "admin"]} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="results" element={<MyResults />} />
                <Route path="attendance" element={<MyAttendance />} />
                <Route path="notices" element={<MyNotices />} />
                <Route path="library" element={<ELibrary />} />
                <Route path="fees" element={<Fees />} />
              </Route>
            </Route>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}