export async function onRequestPost(context) {
  const body = await context.request.json();
  const token = context.env.AI_SEARCH_TOKEN; //must be thesame name as in secrete on cloudflare dashboard



  const AI_SEARCH_URL = "https://812c9de5-cd6e-4984-af1f-ac3549a2e1b4.search.ai.cloudflare.com/chat/completions";
//  const AI_SEARCH_URL = "https://af8040a0-e82a-4545-9928-47672b5202fe.search.ai.cloudflare.com/search"
  // CLOUDFLARE AI EXPECTS THIS STRUCTURE:

  const systemInstruction =
  ` Role: You are a precise data extraction assistant that follows formatting rules with 100% accuracy.
    Task: [Insert your specific question or task here]
    Constraints & Formatting:
    Clarity: Keep your response clear and concise. Use bullet points or numbered lists where appropriate.
    Structure: Your output must strictly follow this exact 3-line format:
    Line 1: Your direct answer.
    Line 2: The relevant context extracted from the document.
    Line 3: The Google Doc URL which located at the first row of the document
    No Fluff: Do not include introductory or concluding remarks. Provide only the requested information.`
    ;

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

