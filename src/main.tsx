import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/globals.css";
import { Routes } from "./Routes";
import { Toaster } from "@/components/ui/toaster";

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMocks } = await import("./mocks");
    await startMocks();
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Routes />
      <Toaster />
    </React.StrictMode>,
  );
}

bootstrap();
