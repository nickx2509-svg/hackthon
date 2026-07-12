import fs from "fs";

const previewText = {
  english: "Hello! I'm your MockMate AI interviewer. This is how I'll sound during your interview. Let's begin.",
  hindi: "नमस्ते! मैं आपका MockMate AI इंटरव्यूअर हूँ। इंटरव्यू के दौरान मेरी आवाज़ कुछ ऐसी होगी। चलिए शुरू करते हैं।",
  hinglish: "Hello! Main aapka MockMate AI interviewer hoon. Interview ke dauran meri voice kuch aisi hogi. Chaliye shuru karte hain.",
};

const langs = ["english", "hindi", "hinglish"];
const genders = ["male", "female"];

for (const language of langs) {
  for (const gender of genders) {
    console.log(`Generating ${language}-${gender}...`);
    const res = await fetch("http://localhost:3000/api/tts/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: previewText[language], language, gender }),
    });
    if (!res.ok) {
      console.error(`FAILED ${language}-${gender}:`, await res.text());
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(`public/voice-previews/${language}-${gender}.mp3`, buf);
    console.log(`saved ${language}-${gender}.mp3`);
  }
}
console.log("DONE. Check public/voice-previews folder.");