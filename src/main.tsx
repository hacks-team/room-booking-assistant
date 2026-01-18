import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/globals.css";
import { Routes } from "./Routes";

async function bootstrap() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Routes />
    </React.StrictMode>,
  );
}

bootstrap();
