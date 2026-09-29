import { useState } from "react";

interface PropsI {
  onSubmit: (idInstance: string, apiTokenInstance: string) => void;
}

export function CredentialsScreen({ onSubmit }: PropsI) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

  const ready = idInstance.trim() !== "" && apiTokenInstance.trim() !== "";

  return (
    <div className="auth">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(idInstance.trim(), apiTokenInstance.trim());
        }}
      >
        <div className="auth-logo" aria-hidden="true" />
        <h1>MAX</h1>
        <p className="auth-sub">Прототип чата через GREEN-API</p>

        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1100000001"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <button type="submit" className="primary" disabled={!ready}>
          Войти
        </button>

        <p className="auth-hint">
          Данные берутся из личного кабинета GREEN-API и никуда не сохраняются —
          они живут только до перезагрузки страницы.
        </p>
      </form>
    </div>
  );
}
