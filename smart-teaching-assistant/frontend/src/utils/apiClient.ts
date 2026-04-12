// src/utils/apiClient.ts

const BASE_URL = (import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

type JSONResponse<T = any> = Promise<T>;

async function timedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 120000   // ✅ increased (was 30000)
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...init, signal: controller.signal });

    const ct = res.headers.get("content-type") || "";

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
    }

    if (ct.includes("application/json")) return await res.json();

    return (await res.text()) as any;

  } finally {
    clearTimeout(id);
  }
}


export async function processPdf(
  file: File
): JSONResponse<{ chunks: { id: number; text: string }[] }> {

  const fd = new FormData();
  fd.append("file", file);

  return timedFetch(
    `${BASE_URL}/process_pdf`,
    { method: "POST", body: fd },
    120000   // ✅ increased (was 60000)
  );
}


export async function askQuestion(
  payload: any
): JSONResponse<{ answer: string }> {

  return timedFetch(
    `${BASE_URL}/ask_question`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    120000   // ✅ increased (was 45000)
  );
}


/**
 * Optional: voice endpoint that returns audio file (mp3).
 * Backend should return FileResponse.
 */
export async function askQuestionVoice(
  payload: any
): Promise<{ blob: Blob; url: string }> {

  const res = await fetch(`${BASE_URL}/ask_question_voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return { blob, url };
}


export async function sttUpload(
  file: File
): JSONResponse<{ text?: string; error?: string }> {

  const fd = new FormData();
  fd.append("file", file);

  return timedFetch(
    `${BASE_URL}/stt`,
    { method: "POST", body: fd },
    120000   // already OK
  );
}


export default {
  processPdf,
  askQuestion,
  askQuestionVoice,
  sttUpload
};