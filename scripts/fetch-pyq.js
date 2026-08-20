async function run() {
  try {
    const res = await fetch("https://www.studyos.co.in/api/pyq_stats");
    const data = await res.json();
    const keys = Object.keys(data);
    console.log("Total keys:", keys.length);
    console.log("First 5 keys:", keys.slice(0, 5));
    console.log("Sample value for first key (" + keys[0] + "):", JSON.stringify(data[keys[0]], null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
