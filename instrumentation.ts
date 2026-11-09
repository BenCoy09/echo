/** Runs once when the server starts. Restores receipts from the remote copy (or seeds it from the committed file). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { remoteEnabled, pullRemote, pushRemote } = await import("./lib/remote");
  if (!remoteEnabled) return;
  const fs = await import("fs"), path = await import("path");
  const file = path.join(process.cwd(), "data", "receipts.json");
  try {
    const remote = await pullRemote();
    if (remote) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, remote); }
    else if (fs.existsSync(file)) await pushRemote(fs.readFileSync(file, "utf8"));
  } catch { /* remote down: fall back to the local file */ }
}
