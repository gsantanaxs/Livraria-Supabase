import { useState } from "react";
import { useAuth } from "./AuthContext";

const AUTH_CSS = `
  .auth-overlay { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; overflow-y: auto; padding: 24px 16px; background: rgba(12, 8, 6, .86); backdrop-filter: blur(8px); }
  .auth-panel { position: relative; width: min(440px, 100%); padding: 34px; border: 1px solid #65462F; border-radius: 6px; background: #241710; box-shadow: 0 24px 80px rgba(0,0,0,.45); }
  .auth-close { position: absolute; top: 12px; right: 14px; width: 36px; height: 36px; border: 0; background: transparent; color: #D8C8B8; font-size: 26px; }
  .auth-kicker { color: #D9A84E; font: 11px monospace; letter-spacing: 2px; text-transform: uppercase; }
  .auth-panel h2 { margin: 12px 0 8px; color: #F5EDE1; font: 400 34px Georgia, serif; }
  .auth-subtitle { margin: 0 0 24px; color: #A99383; font-size: 14px; line-height: 1.55; }
  .auth-google { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 48px; border: 1px solid #806E60; border-radius: 4px; background: #F5EDE1; color: #241710; font-weight: 700; }
  .auth-google:disabled, .auth-submit:disabled { cursor: wait; opacity: .65; }
  .auth-google-g { color: #4285F4; font: 700 20px Arial, sans-serif; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #8F7A6C; font: 11px monospace; text-transform: uppercase; }
  .auth-divider::before, .auth-divider::after { height: 1px; flex: 1; background: #493327; content: ''; }
  .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 18px; border-bottom: 1px solid #493327; }
  .auth-tab { padding: 11px 6px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #A99383; }
  .auth-tab.active { border-color: #D9A84E; color: #F5EDE1; }
  .auth-field { display: block; margin-bottom: 15px; color: #D8C8B8; font-size: 13px; }
  .auth-field input { display: block; width: 100%; min-height: 46px; margin-top: 7px; padding: 11px 12px; border: 1px solid #65462F; border-radius: 3px; outline: none; background: #1B120D; color: #F5EDE1; }
  .auth-field input:focus { border-color: #D9A84E; }
  .auth-submit { width: 100%; min-height: 48px; margin-top: 4px; border: 0; border-radius: 3px; background: #B8863B; color: #1B120D; font-weight: 700; }
  .auth-message { margin: 14px 0 0; color: #F2A69A; font-size: 13px; line-height: 1.5; }
  .auth-message.success { color: #B9D8A8; }
  @media (max-width: 480px) { .auth-panel { padding: 30px 22px 24px; } .auth-panel h2 { font-size: 30px; } }
`;

export default function AuthScreen({ onClose }) {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ text: "", success: false });

    const result = mode === "signup"
      ? await signUp(email, password)
      : await signIn(email, password);

    if (result.error) {
      setMessage({ text: result.error.message, success: false });
    } else if (mode === "signup" && !result.data.session) {
      setMessage({ text: "Cadastro criado. Confira seu e-mail para confirmar a conta.", success: true });
    } else {
      onClose();
    }
    setBusy(false);
  }

  async function continueWithGoogle() {
    setBusy(true);
    setMessage({ text: "", success: false });
    const { error } = await signInWithGoogle();
    if (error) {
      setMessage({ text: error.message, success: false });
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={function (event) {
      if (event.target === event.currentTarget) onClose();
    }}>
      <style>{AUTH_CSS}</style>
      <section className="auth-panel" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <div className="auth-kicker">Alfarrábio · área de gestão</div>
        <h2 id="auth-title">{mode === "signup" ? "Crie sua conta" : "Entre na sua conta"}</h2>
        <p className="auth-subtitle">Acesse sua conta para gerenciar o acervo da livraria.</p>
        <button className="auth-google" type="button" onClick={continueWithGoogle} disabled={busy}>
          <span className="auth-google-g" aria-hidden="true">G</span>
          Entrar com Google
        </button>
        <div className="auth-divider">ou use seu e-mail</div>
        <div className="auth-tabs" role="tablist" aria-label="Autenticação">
          <button className={mode === "login" ? "auth-tab active" : "auth-tab"} type="button" onClick={function () { setMode("login"); setMessage({ text: "", success: false }); }}>Login</button>
          <button className={mode === "signup" ? "auth-tab active" : "auth-tab"} type="button" onClick={function () { setMode("signup"); setMessage({ text: "", success: false }); }}>Cadastro</button>
        </div>
        <form onSubmit={submit}>
          <label className="auth-field">
            E-mail
            <input type="email" autoComplete="email" value={email} onChange={function (event) { setEmail(event.target.value); }} required />
          </label>
          <label className="auth-field">
            Senha
            <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} value={password} onChange={function (event) { setPassword(event.target.value); }} required />
          </label>
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
          </button>
        </form>
        {message.text && <p className={message.success ? "auth-message success" : "auth-message"} role="status">{message.text}</p>}
      </section>
    </div>
  );
}