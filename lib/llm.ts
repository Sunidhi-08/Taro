export async function generateCompanyBrief(companyText: string, jobDescription: string): Promise<{ summary: string; whatTheyDo: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const firstSentence = companyText ? companyText.split(/[.!?]/)[0]?.trim() : 'Company information is limited.';
    return {
      summary: firstSentence || 'This company appears to be a technology-focused employer with an emphasis on product, engineering, and delivery.',
      whatTheyDo: `The role focuses on skills closely aligned with: ${jobDescription.slice(0, 180) || 'technical and collaborative execution'}.`,
    };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Return valid JSON only with keys summary and whatTheyDo. Company info: ${companyText.slice(0, 5000)} Job description: ${jobDescription.slice(0, 2000)}` }] }],
      }),
    });

    if (!response.ok) throw new Error('Gemini unavailable');
    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text.replace(/```|json/g, '').trim());
    return {
      summary: parsed.summary || 'This company is focused on hiring strong technical and collaborative talent.',
      whatTheyDo: parsed.whatTheyDo || 'The team is building and delivering products with a strong emphasis on execution and customer outcomes.',
    };
  } catch {
    return {
      summary: 'This company is focused on hiring strong technical and collaborative talent.',
      whatTheyDo: 'The role is centered on product execution, communication, and the ability to contribute effectively in a fast-moving environment.',
    };
  }
}
