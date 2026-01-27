import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./store/auth.js";
import TopNav from "./components/TopNav.jsx";
import Footer from "./components/Footer.jsx";

import GuestSearch from "./pages/GuestSearch.jsx";
import ConnectWallet from "./pages/ConnectWallet.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Issuer from "./pages/Issuer.jsx";
import Student from "./pages/Student.jsx";
import Verify from "./pages/Verify.jsx";
import CertDetail from "./pages/CertDetail.jsx";

export default function App() {
  const { setHydrated } = useAuth();
  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return (
    <>
      <TopNav />
      <main className="container">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issuer" element={<Issuer />} />
          <Route path="/student" element={<Student />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/cert/:cid" element={<CertDetail />} />
          <Route path="/connect-wallet" element={<ConnectWallet />} />{" "}
          <Route path="/guest" element={<GuestSearch />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
