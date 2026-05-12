async function tryTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return null;
  try {
    const httpUrl = url.replace("libsql://", "https://");
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2000);
    const res = await fetch(`${httpUrl}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT 1" } }] }),
      signal: ac.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return true;
  } catch { return null; }
}

let _tursoOk: boolean | null = null;

async function tursoOk() {
  if (_tursoOk === null) _tursoOk = (await tryTurso()) === true;
  return _tursoOk;
}
