import { createHash } from "crypto";
import { canonical } from "./canonical";

export { canonical };
export const hashEvidence = (e: unknown) => createHash("sha256").update(canonical(e)).digest("hex");
