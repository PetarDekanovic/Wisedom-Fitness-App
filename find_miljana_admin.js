async function run() {
  console.log("Acquiring Google Cloud Access Token from Metadata Server...");
  let accessToken;
  try {
    const tokenRes = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-account/default/token", {
      headers: { "Metadata-Flavor": "Google" }
    });
    if (!tokenRes.ok) {
      throw new Error(`Failed to get token: ${tokenRes.statusText}`);
    }
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    console.log("Token successfully acquired!");
  } catch (err) {
    console.warn("Could not retrieve metadata token (perhaps running locally?):", err.message);
    console.log("Falling back to unauthenticated (might fail if rules deny list)...");
  }

  const projectId = "gen-lang-client-0833207836";
  const databaseId = "ai-studio-4d7e1cec-5733-4ce6-a67d-e27f38f60915";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/public_profiles?pageSize=100`;

  const headers = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error("HTTP error:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    if (!data.documents) {
      console.log("No profiles found.");
      return;
    }

    console.log("Found profiles count:", data.documents.length);
    let matched = false;
    for (const doc of data.documents) {
      const fields = doc.fields || {};
      const name = fields.name?.stringValue || "";
      if (name.toLowerCase().includes("miljana") || name.toLowerCase().includes("mucaji")) {
        matched = true;
        console.log("\n=========================================");
        console.log("MATCH FOUND IN PUBLIC_PROFILES!");
        console.log("Document Name:", doc.name);
        
        // Pretty print fields
        const formatted = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value.stringValue !== undefined) formatted[key] = value.stringValue;
          else if (value.integerValue !== undefined) formatted[key] = parseInt(value.integerValue);
          else if (value.doubleValue !== undefined) formatted[key] = parseFloat(value.doubleValue);
          else if (value.booleanValue !== undefined) formatted[key] = value.booleanValue;
          else if (value.arrayValue !== undefined) {
            formatted[key] = (value.arrayValue.values || []).map(v => v.stringValue || JSON.stringify(v));
          } else {
            formatted[key] = value;
          }
        }
        console.log(JSON.stringify(formatted, null, 2));
        console.log("=========================================\n");
      }
    }
    if (!matched) {
      console.log("Miljana Mucaji not found in public_profiles. Let's check social posts or other collections.");
    }
  } catch (err) {
    console.error("Error fetching profiles:", err);
  }
}

run();
