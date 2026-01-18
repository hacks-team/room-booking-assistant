export async function startMocks() {
  if (typeof window === "undefined") return;

  const { worker } = await import("./browser");
  const workerUrl = new URL("mockServiceWorker.js", window.location.origin + (import.meta.env.BASE_URL || "/"))
    .pathname;

  try {
    await worker.start({
      serviceWorker: {
        url: workerUrl,
      },
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.error("[msw] failed to start. Did you generate mockServiceWorker.js?", error);
  }
}
