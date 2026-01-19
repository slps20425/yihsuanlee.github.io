
const twilio = require('twilio');

const SID = "AC69d839f395b4d082982faa0fd1c3cfe9";
const TOKEN = "7f4742f8ccf138c8032f4292eead3caf";

const client = twilio(SID, TOKEN);

async function run() {
    console.log("Debug using User Credentials...");

    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    console.log("Start Date (30 days ago):", startDateStr);

    console.log("\n--- Fetching DAILY Records ---");
    try {
        const records = await client.usage.records.daily.list({
            startDate: startDateStr,
            limit: 50
        });

        console.log(`Daily Count: ${records.length}`);
        records.forEach(r => {
            console.log(`[${r.startDate}] Cat: ${r.category} | Usage: ${r.usage} | Price: ${r.price} | Desc: ${r.description}`);
        });

        if (records.length === 0) console.log("!! NO RECORDS FOUND !!");

    } catch (e) {
        console.error("Daily Error:", e.message);
    }

    console.log("\n--- Fetching SUMMARY Records ---");
    try {
        const summary = await client.usage.records.list({ limit: 50 });
        console.log(`Summary Count: ${summary.length}`);
        summary.forEach(r => {
            console.log(`[Summary] Cat: ${r.category} | Price: ${r.price} | Desc: ${r.description}`);
        });
    } catch (e) {
        console.error("Summary Error:", e.message);
    }
}

run();
