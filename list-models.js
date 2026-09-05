const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.log("No API key found in .env");
  process.exit(1);
}

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => {
      console.log(`- ${m.name}`);
    });
  } catch(e) {
    console.error(e);
  }
}
run();
