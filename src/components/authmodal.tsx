"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onLogged?: () => void; // chama quando logado/cadastrado
};

export default function AuthModal({ open, onClose, onLogged }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleLogin = async () => {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return setMsg(error.message);
    onLogged?.();
    onClose();
  };

  const handleSignup = async () => {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setLoading(false);
    if (error) return setMsg(error.message);
    // Se confirmação de e-mail estiver ativa, o usuário só aparece depois de confirmar.
    onLogged?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h2>

        <label className="mb-2 block text-sm">E-mail</label>
        <input
          className="mb-3 w-full rounded-lg border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />

        <label className="mb-2 block text-sm">Senha</label>
        <input
          className="mb-4 w-full rounded-lg border px-3 py-2"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••••••"
        />

        {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="h-10 flex-1 rounded-lg border px-4"
            disabled={loading}
          >
            Cancelar
          </button>

          {mode === "login" ? (
            <button
              onClick={handleLogin}
              className="h-10 flex-1 rounded-lg bg-violet-600 px-4 text-white"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          ) : (
            <button
              onClick={handleSignup}
              className="h-10 flex-1 rounded-lg bg-violet-600 px-4 text-white"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          )}
        </div>

        <button
          className="mt-4 w-full text-center text-sm text-violet-700"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          disabled={loading}
        >
          {mode === "login"
            ? "Não tem conta? Criar conta"
            : "Já possui conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
