import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Page from "./Pages/Dashboard";
import Students from "./Pages/Students";
import Posts from "./Pages/Posts";
import Teams from "./Pages/Teams";
import Projects from "./Pages/Projects";
import Managers from "./Pages/Managers";
import Attendance from "./Pages/Attendance";
import AttendanceSettings from "./Pages/AttendanceSettings";
import AdminCalendar from "./Pages/AdminCalendar";
import FormBuilder from "./Pages/FormBuilder";
import PublicRegistration from "./Pages/PublicRegistration";
import UserLayout from "./components/layout/userLayout";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./auth/Login";
import { Toaster } from "@/components/ui/sonner";


import { ThemeProvider } from "@/components/theme-provider";

import { App as AntdApp } from "antd";

const App = () => {
  return (
    <AntdApp>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Toaster />
          <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute> <UserLayout /> </PrivateRoute>}>
              <Route index element={<Page />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/form-builder" element={<FormBuilder />} />
              <Route path="/admin/posts" element={<Posts />} />
              <Route path="/admin/teams" element={<Teams />} />
              <Route path="/admin/projects" element={<Projects />} />
              <Route path="/admin/pm" element={<Managers />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/attendance/settings" element={<AttendanceSettings />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
            </Route>

            {/* Public Registration / Hiring Form (Single source of truth) */}
            <Route path="/register" element={<PublicRegistration />} />
            <Route path="/registration" element={<PublicRegistration />} />
            <Route path="/hiring-form" element={<PublicRegistration />} />
            <Route path="/admin/form-builder/preview" element={<PublicRegistration />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AntdApp>
  )
}

export default App
