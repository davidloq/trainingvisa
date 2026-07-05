export async function onRequestPost(context) {
  const body = await context.request.json();
  const token = context.env.AI_SEARCH_TOKEN; 

  const AI_SEARCH_URL = "https://af8040a0-e82a-4545-9928-47672b5202fe.search.ai.cloudflare.com/chat/completions";

  // CLOUDFLARE AI EXPECTS THIS STRUCTURE:
  const payload = {
    messages: [
      { role: "user", content: body.message || body.content || JSON.stringify(body) }
    ]
  };

  try {
    const response = await fetch(AI_SEARCH_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If it's a 400, the errorText will tell us EXACTLY what field is missing
      return new Response(JSON.stringify({ error: `AI Search failed: ${response.status}`, details: errorText }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
  // Explicitly set the headers to ensure the browser expects UTF-8
    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json; charset=utf-8" 
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

