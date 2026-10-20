export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return Response.json(
      {
        status: "error",
        message:
          "Supabase-Konfiguration unvollständig. Projekt-URL und Publishable Key müssen gesetzt sein.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return Response.json(
        {
          status: "error",
          message: `Supabase Auth antwortet mit HTTP ${response.status}. Prüfe Projekt-URL und Publishable Key.`,
        },
        { status: 502 },
      );
    }

    return Response.json({
      status: "ok",
      message: "Verbindung zu Supabase Auth erfolgreich.",
    });
  } catch (error) {
    const message =
      error.name === "TimeoutError" || error.name === "AbortError"
        ? "Zeitüberschreitung bei der Verbindung zu Supabase Auth."
        : "Supabase Auth ist nicht erreichbar. Prüfe Netzwerk und Projekt-URL.";

    return Response.json({ status: "error", message }, { status: 502 });
  }
}
