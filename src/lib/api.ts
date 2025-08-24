import { API_BASE } from "./config";

export async function uploadPdf(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPageSummary(doc_id: string, page_index: number, user_prompt: string) {
  const res = await fetch(`${API_BASE}/page_summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id, page_index, user_prompt }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTopicSummary(doc_id: string, topic_id: string) {
  const res = await fetch(`${API_BASE}/topic_summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id, topic_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
