import fs from "fs";
import path from "path";
import { remoteEnabled, pullRemote, pushRemote } from "./lib/remote";

/** Restore receipts from the remote copy, or seed the remote from the committed file on first boot. */
export async function restoreReceipts() {
  if (!remoteEnabled) return;
  const file = path.join(process.cwd(), "data", "receipts.json");
  try {
    const remote = await pullRemote();
    if (remote) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, remote); }
    else if (fs.existsSync(file)) await pushRemote(fs.readFileSync(file, "utf8"));
  } catch { /* remote down: fall back to the local file */ }
}
