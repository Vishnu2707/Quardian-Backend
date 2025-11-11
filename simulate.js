import fetch from "node-fetch";

const API = "https://quardian-backend.onrender.com/api";

async function simulate() {
  const ops = ["encrypt", "decrypt", "verify"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  try {
    let res;
    if (op === "encrypt") {
      res = await fetch(`${API}/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "simulated message" })
      });
    } else if (op === "decrypt") {
      // just re-encrypt + decrypt fake data
      res = await fetch(`${API}/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "temp decrypt" })
      });
      const data = await res.json();
      res = await fetch(`${API}/decrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext: data.ciphertext,
          key: data.key,
          iv: data.iv,
          tag: data.tag
        })
      });
    } else {
      const s = await fetch(`${API}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "verify simulation" })
      });
      const signData = await s.json();
      res = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "verify simulation",
          publicKey: signData.publicKey,
          signature: signData.signature
        })
      });
    }
    console.log(`${op.toUpperCase()} simulated`);
  } catch (e) {
    console.error("Simulation error:", e.message);
  }
}

setInterval(simulate, 3000); // every 3 seconds
