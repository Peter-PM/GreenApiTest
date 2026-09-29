import { useState } from "react";
import "./App.css";
import { CredentialsScreen } from "./components/CredentialsScreen";
import { Workspace } from "./components/Workspace";
import type { CredentialsI } from "./api/types";

export default function App() {
  const [creds, setCreds] = useState<CredentialsI | null>(null);

  if (!creds) {
    return (
      <CredentialsScreen
        onSubmit={(idInstance, apiTokenInstance) =>
          setCreds({ idInstance, apiTokenInstance })
        }
      />
    );
  }

  return <Workspace creds={creds} onLogout={() => setCreds(null)} />;
}
