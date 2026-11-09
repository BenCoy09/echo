/** Runs once when the server starts. Node-only work lives in a separate file so the Edge build never sees fs/path. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { restoreReceipts } = await import("./instrumentation-node");
    await restoreReceipts();
  }
}
