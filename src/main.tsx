import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../styles/globals.css";
import { Routes } from "./Routes";
import { Toaster } from "@/components/ui/toaster";
import { NuqsAdapter } from 'nuqs/adapters/react'

const queryClient = new QueryClient();

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMocks } = await import("./mocks");
    await startMocks();
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <Routes />
          <Toaster />
        </NuqsAdapter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

bootstrap();
