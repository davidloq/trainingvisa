export async function onRequestPost(context) {
  const body = await context.request.json();
  const token = context.env.AI_SEARCH_TOKEN; //must be thesame name as in secrete on cloudflare dashboard



  const AI_SEARCH_URL = "https://812c9de5-cd6e-4984-af1f-ac3549a2e1b4.search.ai.cloudflare.com/chat/completions";
//  const AI_SEARCH_URL = "https://af8040a0-e82a-4545-9928-47672b5202fe.search.ai.cloudflare.com/search"
  // CLOUDFLARE AI EXPECTS THIS STRUCTURE:

const systemInstruction = `
- ROLE: You are an expert data extraction assistant.
- RULE 1 (CRITICAL): The master document URL is located in the first row, second column (index [0][1]) of the CSV header. ALWAYS use this exact URL for every response. 
- RULE 2: Do not use or extract any other URLs found within the body of the rows (such as tour-specific links) unless explicitly asked to do so.
- FORMATTING: You must output exactly three lines:
  Line 1: [Your Answer]
  Line 2: [Contextual evidence from the document]
  Line 3: [The master document URL]
- No conversational filler or introductory text.
`;

  const payload = {
    messages: [
      { role: "system", content: systemInstruction },
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

