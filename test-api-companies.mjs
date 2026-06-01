const input = { page: 1, limit: 12 };
const url = `http://localhost:3000/api/trpc/company.list?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;

try {
  const resp = await fetch(url);
  const json = await resp.json();
  console.log("Response:", JSON.stringify(json, null, 2).substring(0, 1000));
  if (json.result?.data?.companies) {
    console.log(`\n✅ Found ${json.result.data.companies.length} companies`);
  }
} catch (e) {
  console.error("Error:", e.message);
}
