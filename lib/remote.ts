// Optional durable copy of the receipts file in Upstash Redis (free tier, REST API, no driver).
// Why: free hosts have ephemeral disks. The local file stays the working copy; this is the backup that survives restarts.
const URL_ = process.env.UPSTASH_REDIS_REST_URL, TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN, KEY = "echo:receipts";
export const remoteEnabled = Boolean(URL_ && TOKEN);
const auth = { Authorization: `Bearer ${TOKEN}` };

export async function pullRemote(): Promise<string | null> {
  const r = await fetch(`${URL_}/get/${KEY}`, { headers: auth, cache: "no-store" });
  return (await r.json())?.result ?? null;
}
export async function pushRemote(json: string): Promise<void> {
  await fetch(`${URL_}/set/${KEY}`, { method: "POST", headers: auth, body: json }).catch(() => {});
}
