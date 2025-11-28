// src/pages/SignInPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardBody, CardFooter, CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { Radio } from "../components/ui/Radio.jsx";

import layout from "../styles/signin.module.css";
import form from "../styles/form.module.css";

import { useAuth } from "../store/auth.js";
import { API } from "../lib/api.js";
import { shorten } from "../lib/utils.js";

const ROLES = [
  {
    key: "student",
    label: "Student",
    description: "View and share your verified certificates.",
  },
  {
    key: "issuer",
    label: "Issuer",
    description: "Issue certificates on behalf of your institution.",
  },
  {
    key: "verifier",
    label: "Verifier",
    description: "Verify the authenticity of a certificate.",
  },
];

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("student");
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [signingWallet, setSigningWallet] = useState(false);
  const [signingEmail, setSigningEmail] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hasEthereum =
    typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    setError("");
    setInfo("");
  }, [role]);

  async function connectWallet() {
    try {
      setConnecting(true);
      setError("");
      if (!hasEthereum) {
        setError("MetaMask not detected. Please install MetaMask to continue.");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const acc = accounts?.[0] || "";
      setAddress(acc);
      setInfo(`Connected wallet: ${shorten(acc)}`);
    } catch (e) {
      setError(e?.message || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  }

  async function signInWithWallet() {
    try {
      setSigningWallet(true);
      setError("");
      if (!address) {
        setError("Please connect your wallet first.");
        return;
      }

      // Get nonce from backend (mocked or real)
      const nonceRes = await API.requestNonce(address, role);
      const nonce =
        typeof nonceRes === "string" ? nonceRes : nonceRes?.nonce;
      if (!nonce) throw new Error("Could not get nonce from server.");

      const message = `Acadi-chain wants you to sign in.\n\nRole: ${role}\nAddress: ${address}\nNonce: ${nonce}`;

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      const verified = await API.verifySignature({
        address,
        role,
        signature,
        message,
      });

      const token = verified?.token;
      if (!token) throw new Error("Signature verification failed.");

      login({ token, role, address });

      // Route by role
      if (role === "student") {
        navigate("/dashboard/student");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e?.message || "Failed to sign in with wallet.");
    } finally {
      setSigningWallet(false);
    }
  }

  async function signInWithEmail(e) {
    e.preventDefault();
    try {
      setSigningEmail(true);
      setError("");

      if (!email || !password) {
        throw new Error("Enter email and password.");
      }

      // Compatible with mock + real backend
      const resp = await API.emailLogin(email, password, role);
      const token = resp?.token || `demo-${Date.now()}`;

      login({ token, role, address: null });

      if (role === "student") {
        // Student must connect wallet before accessing student pages
        navigate("/connect-wallet");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e?.message || "Failed to sign in.");
    } finally {
      setSigningEmail(false);
    }
  }

  return (
    <div className={layout.wrap}>
      <div className={`container ${layout.grid}`}>
        {/* LEFT COLUMN – main sign-in */}
        <section className={layout.section}>
          <Card>
            <CardHeader>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    background: "var(--primary)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                  }}
                >
                  🎓
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    Acadi-chain
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    Decentralized academic certificates.
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {/* Role selection */}
              <div style={{ marginBottom: 16 }}>
                <div className={form.label}>Choose your role</div>
                <div className={layout.roleGrid}>
                  {ROLES.map((r) => (
                    <div
                      key={r.key}
                      className={`${layout.roleItem} ${
                        role === r.key ? layout.roleItemActive : ""
                      }`}
                      onClick={() => setRole(r.key)}
                    >
                      <Radio
                        checked={role === r.key}
                        onChange={() => setRole(r.key)}
                        label={r.label}
                        description={r.description}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet sign-in */}
              <div style={{ marginBottom: 16 }}>
                <div className={form.label}>Web3 sign-in (wallet)</div>
                <div className={form.actions}>
                  <Button
                    variant="secondary"
                    onClick={connectWallet}
                    disabled={connecting}
                  >
                    {address
                      ? shorten(address)
                      : connecting
                      ? "Connecting…"
                      : "Connect MetaMask"}
                  </Button>
                  <Button
                    onClick={signInWithWallet}
                    disabled={!address || signingWallet}
                  >
                    {signingWallet ? "Signing…" : "Sign in with wallet"}
                  </Button>
                </div>
                {!hasEthereum && (
                  <div
                    className={form.help}
                    style={{ marginTop: 6 }}
                  >
                    MetaMask not found. Install it to enable wallet login.
                  </div>
                )}
              </div>

              {/* Separator */}
              <div
                className={layout.separator}
                style={{ margin: "16px 0" }}
              >
                <div className={layout.separatorLine}></div>
                <span className={layout.small}>or sign in with email</span>
                <div className={layout.separatorLine}></div>
              </div>

              {/* Email/password sign-in */}
              <form
                onSubmit={signInWithEmail}
                className={form.row}
                style={{ marginBottom: 8 }}
              >
                <div>
                  <div className={form.label}>Email</div>
                  <Input
                    type="email"
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className={form.label}>Password</div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" full disabled={signingEmail}>
                  {signingEmail ? "Signing in…" : "Sign in with email"}
                </Button>
                {role === "student" && (
                  <div className={form.help}>
                    Students signing in with email will be asked to connect
                    their wallet before accessing their dashboard.
                  </div>
                )}
              </form>

              {/* Messages */}
              {error && (
                <div className={form.error} style={{ marginTop: 8 }}>
                  {error}
                </div>
              )}
              {info && !error && (
                <div className={form.success} style={{ marginTop: 8 }}>
                  {info}
                </div>
              )}

              {/* Continue as guest */}
              <div
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                <span style={{ color: "var(--muted)" }}>
                  Just want to verify a certificate?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/guest")}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--accent)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 13,
                  }}
                >
                  Continue as guest
                </button>
              </div>
            </CardBody>

            <CardFooter>
              By continuing, you agree to the Terms and acknowledge this is a
              demo environment.
            </CardFooter>
          </Card>
        </section>

        {/* RIGHT COLUMN – info / onboarding */}
        <section className={layout.section}>
          <Card>
            <CardBody>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                How Acadi-chain works
              </div>
              <ul
                style={{
                  marginTop: 8,
                  paddingLeft: 18,
                  color: "var(--muted)",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <li>Issuers publish certificates to IPFS and the blockchain.</li>
                <li>Students control their certificates via their wallet.</li>
                <li>
                  Verifiers check authenticity using the certificate ID (CID) or
                  transaction hash.
                </li>
              </ul>

              <div
                style={{
                  marginTop: 20,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fafafa",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Tips for this demo
                </div>
                <ol style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Sign in as Issuer to issue a test certificate.</li>
                  <li>
                    Sign in as Student with email, then connect the same wallet
                    used in issuance.
                  </li>
                  <li>
                    Use Guest or Verifier to look up the certificate by CID.
                  </li>
                </ol>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
