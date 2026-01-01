import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/Dashboard";

import AdminDashboard from "./pages/admin2/AdminDashboard";
import IssuerDashboard from "./pages/issuer/IssuerDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import VerifyDashboard from "./pages/verifier/VerifyDashboard";
import GuestVerify from "./pages/guest/GuestVerify";

export default function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/verifier" element={<VerifyDashboard />} />

        <Route path="/guest" element={<GuestVerify />} />
      </Routes>
      <Footer />
    </>
  );
}
