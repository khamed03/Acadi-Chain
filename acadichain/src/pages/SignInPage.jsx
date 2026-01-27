import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardBody, CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

import layout from "../styles/signin.module.css";
import form from "../styles/form.module.css";

import { useAuth } from "../store/auth.js";
import { API } from "../lib/api.js";
import { shorten } from "../lib/utils.js";
import { getAppRoleFromChain } from "../lib/web3.js";

function isEthAddress(v) {
  if (!v) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [signingWallet, setSigningWallet] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const hasEthereum = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    setError("");
    setInfo("");
  }, [address]);

  async function connectWallet() {
    try {
      setConnecting(true);
      setError("");
      setInfo("");

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
      if (e?.code === -32002) {
        setError("MetaMask request already pending. Open MetaMask and approve it.");
      } else if (e?.code === 4001) {
        setError("Connection request rejected in MetaMask.");
      } else {
        setError(e?.message || "Failed to connect wallet.");
      }
    } finally {
      setConnecting(false);
    }
  }

  async function signInWithWallet() {
    try {
      setSigningWallet(true);
      setError("");
      setInfo("");

      if (!address) {
        setError("Please connect your wallet first.");
        return;
      }

      if (!hasEthereum) {
        setError("MetaMask is required to sign in.");
        return;
      }

      const role = await getAppRoleFromChain(address);
      if (!role) {
        setError("This wallet has no role on-chain yet.");
        return;
      }

      const nonceRes = await API.requestNonce(address, role);
      const nonce = nonceRes?.nonce;
      if (!nonce) throw new Error("Failed to get nonce.");

      const message = `Acadi-chain sign-in.\n\nRole: ${role}\nAddress: ${address}\nNonce: ${nonce}`;

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
      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Failed to sign in.");
    } finally {
      setSigningWallet(false);
    }
  }

  return (
    <div className={layout.wrap}>
      <div className={layout.grid}>
        <section className={layout.section}>
          <Card>
            {/* HEADER */}
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "var(--primary)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 20,
                  }}
                >
                  🎓
                </div>

                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  Acadi-chain
                </div>

                <div style={{ color: "var(--muted)", fontSize: 14 }}>
                  Decentralized academic certificates.
                </div>
              </div>
            </CardHeader>

            {/* BODY */}
            <CardBody>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "center",
                }}
              >
                <div className={form.label}>
                  Wallet sign-in (MetaMask)
                </div>

                {/* BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="button"
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
                    type="button"
                    onClick={signInWithWallet}
                    disabled={!address || signingWallet}
                  >
                    {signingWallet ? "Signing…" : "Sign in"}
                  </Button>
                </div>

                {/* INFO / ERROR */}
                {error && (
                  <div className={form.error} style={{ maxWidth: 360 }}>
                    {error}
                  </div>
                )}

                {info && !error && (
                  <div className={form.success} style={{ maxWidth: 360 }}>
                    {info}
                  </div>
                )}

                {/* GUEST */}
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>
                    Just want to verify as guest?{" "}
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
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
