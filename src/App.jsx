import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Entry from "./pages/Entry";
import Login from "./pages/LoginScreen";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageClassrooms from "./pages/ManageClassrooms";
import ManageLocations from "./pages/ManageLocations";
import ManageTimetable from "./pages/ManageTimetable";
import Timetable from "./pages/Timetable";
import AIChat from "./pages/AIChat";
import IndoorMap from "./pages/IndoorMap";
import BuildingMap from "./pages/BuildingMap";
import FindClassroom from "./pages/FindClassroom";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Events from "./pages/Events";
import ManageNotifications from "./pages/ManageNotifications";
import ManageEvents from "./pages/ManageEvents";
import QRGenerator from "./pages/QRGenerator";
import ManageUsers from "./pages/ManageUsers";
import ActivityLog from "./pages/ActivityLog";
import RequestChange from "./pages/RequestChange";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/home" element={<ProtectedRoute allow={["student","faculty","admin"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute allow={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute allow={["student","faculty"]}><Timetable /></ProtectedRoute>} />
      <Route path="/student/map" element={<ProtectedRoute allow={["student","faculty","admin"]}><BuildingMap /></ProtectedRoute>} />

      <Route path="/explore" element={<ProtectedRoute allow={["student","faculty","admin"]}><Explore /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute allow={["student","faculty","admin"]}><BuildingMap /></ProtectedRoute>} />
      <Route path="/find-classroom" element={<ProtectedRoute allow={["student","faculty","admin"]}><FindClassroom /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allow={["student","faculty","admin"]}><Notifications /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute allow={["student","faculty","admin"]}><Events /></ProtectedRoute>} />

      <Route path="/faculty" element={<ProtectedRoute allow={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/timetable" element={<ProtectedRoute allow={["faculty"]}><Timetable /></ProtectedRoute>} />
      <Route path="/faculty/request-change" element={<ProtectedRoute allow={["faculty"]}><RequestChange /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/classrooms" element={<ProtectedRoute allow={["admin"]}><ManageClassrooms /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute allow={["admin"]}><ManageTimetable /></ProtectedRoute>} />
       <Route path="/admin/notifications" element={<ProtectedRoute allow={["admin"]}><ManageNotifications /></ProtectedRoute>} />
       <Route path="/admin/events" element={<ProtectedRoute allow={["admin"]}><ManageEvents /></ProtectedRoute>} />
       <Route path="/admin/locations" element={<ProtectedRoute allow={["admin"]}><ManageLocations /></ProtectedRoute>} />
       <Route path="/admin/qr-generator" element={<ProtectedRoute allow={["admin"]}><QRGenerator /></ProtectedRoute>} />
       <Route path="/admin/users" element={<ProtectedRoute allow={["admin"]}><ManageUsers /></ProtectedRoute>} />
       <Route path="/admin/activity" element={<ProtectedRoute allow={["admin"]}><ActivityLog /></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute allow={["student","faculty","admin"]}><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allow={["student","faculty","admin"]}><Settings /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute allow={["student","faculty","admin"]}><AIChat /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute allow={["student","faculty","admin"]}><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
