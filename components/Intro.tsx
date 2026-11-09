"use client";
import { useState } from "react";
import { Welcome } from "./Welcome";

export function Intro() {
  const [done, setDone] = useState(false);
  return done ? null : <Welcome onDone={() => setDone(true)} />;
}
