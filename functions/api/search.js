export async function onRequestPost(context) {
  const body = await context.request.json();
  const token = context.env.AI_SEARCH_TOKEN; //must be thesame name as in secrete on cloudflare dashboard



  const AI_SEARCH_URL = "https://812c9de5-cd6e-4984-af1f-ac3549a2e1b4.search.ai.cloudflare.com/chat/completions";
//  const AI_SEARCH_URL = "https://af8040a0-e82a-4545-9928-47672b5202fe.search.ai.cloudflare.com/search"
  // CLOUDFLARE AI EXPECTS THIS STRUCTURE:

  const systemInstruction =
  ` You are a helpful assistant. Use the provided context to answer the user's question.
  - If the context does not contain the answer, say "I don't have the information."
  - If the context contains multiple answers, provide a summary of the most relevant information.
  - If the context contains conflicting information, provide a balanced view of the different perspectives.
  - If you cannot find the answer in the context, explicitly state that you don't have the information.
  - Do not make up or hallucinate links.
  - The format of your response should be clear and concise, using bullet points or numbered lists where appropriate.
  - The format of your response must include your answer first, followed by the proof section in a new paragraph at the end.
  - the proof section must include the relevant context from the document, then must be the google doc URL in the first row of that document. Do not include any other links or references in the proof section.
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

