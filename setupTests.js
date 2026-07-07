import React, { useState } from "react";
import axios from "axios";

const SAMPLE_FRAUD = "-2.312227,1.951992,-1.609851,-0.397898,-0.338662,2.043237,-1.353482,0.052474,-3.032424,-3.202033,-0.498213,-0.481728,-1.380003,0.225015,-0.638944,-0.895034,-0.241762,0.062723,-0.219516,0.009116,-0.286086,-0.112765,-0.058032,-0.057501,-0.114025,-0.183361,0.054,0.0,0.0,406";
const SAMPLE_LEGIT = "-1.359807,-0.072781,2.536347,1.378155,-0.338321,0.462388,0.239599,0.098698,0.363787,0.090794,-0.551600,-0.617801,-0.991390,-0.311169,1.468177,-0.470401,0.207971,0.025791,0.403993,0.251412,-0.018307,0.277838,-0.110474,0.066928,0.128539,-0.189115,0.133558,-0.021053,149.62,406";

function App() {
  const [mode, setMode] = useState("simple");
  const [amount, setAmount] = useState("");
  const [csvRow, setCsvRow] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimpleSubmit = async () => {
    if (!amount) { setResult({ error: "Please enter the transaction amount!" }); return; }
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", { Amount: amount });
      setResult(response.data);
    } catch { setResult({ error: "Cannot connect to server. Make sure backend is running." }); }
    setLoading(false);
  };

  const handleCSVSubmit = async () => {
    if (!csvRow) { setResult({ error: "Please paste a transaction row!" }); return; }
    setLoading(true);
    setResult(null);
    try {
      const values = csvRow.trim().split(",").map(Number);
      if (values.length < 29) { setResult({ error: "Invalid! Need 30 values: V1-V28, Amount, Time." }); setLoading(false); return; }
      const payload = {};
      for (let i = 0; i < 28; i++) payload[`V${i + 1}`] = values[i];
      payload["Amount"] = values[28];
      payload["Time"] = values[29] || 0;
      const response = await axios.post("http://127.0.0.1:5000/predict", payload);
      setResult(response.data);
    } catch { setResult({ error: "Cannot connect to server. Make sure backend is running." }); }
    setLoading(false);
  };

  const isFraud = result && result.fraud === true;
  const isLegit = result && result.fraud === false;
  const isError = result && result.error;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "20px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: "800", margin: 0, letterSpacing: "1px" }}>
          Credit Card Fraud Detection
        </h1>
        <p style={{ color: "#a0aec0", fontSize: "0.95rem", marginTop: "8px" }}>
          Powered by Real Kaggle Data
        </p>
      </div>



      {/* Main Card */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "35px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Mode Tabs */}
        <div style={{
          display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "12px",
          padding: "4px", marginBottom: "25px",
        }}>
          {["simple", "advanced"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(null); }} style={{
              flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer",
              fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
              background: mode === m ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent",
              color: mode === m ? "#fff" : "#a0aec0",
            }}>
              {m === "simple" ? "Simple Mode" : "Advanced Mode"}
            </button>
          ))}
        </div>

        {mode === "simple" ? (
          <div>
            <label style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              TRANSACTION AMOUNT ($)
            </label>
            <input
              type="number"
              placeholder="e.g. 150.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", fontSize: "16px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px", color: "#fff", outline: "none",
                boxSizing: "border-box", marginBottom: "8px",
              }}
            />
            <p style={{ color: "#718096", fontSize: "0.8rem", margin: "8px 0 20px" }}>
              Simple mode uses Amount only — less accurate. Use Advanced for real results.
            </p>
          </div>
        ) : (
          <div>
            <label style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              TRANSACTION DATA (V1–V28, Amount, Time)
            </label>
            <textarea
              rows={5}
              placeholder="Paste 30 comma-separated values: V1,V2,...,V28,Amount,Time"
              value={csvRow}
              onChange={e => setCsvRow(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", fontSize: "12px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px", color: "#fff", outline: "none", resize: "vertical",
                fontFamily: "monospace", boxSizing: "border-box", marginBottom: "12px",
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button onClick={() => setCsvRow(SAMPLE_FRAUD)} style={{
                flex: 1, padding: "10px", background: "rgba(229,62,62,0.2)",
                border: "1px solid rgba(229,62,62,0.4)", borderRadius: "10px",
                color: "#fc8181", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              }}>
                Load Fraud Sample
              </button>
              <button onClick={() => setCsvRow(SAMPLE_LEGIT)} style={{
                flex: 1, padding: "10px", background: "rgba(72,187,120,0.2)",
                border: "1px solid rgba(72,187,120,0.4)", borderRadius: "10px",
                color: "#68d391", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              }}>
                Load Legit Sample
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={mode === "simple" ? handleSimpleSubmit : handleCSVSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "15px", fontSize: "16px", fontWeight: "700",
            border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "rgba(102,126,234,0.4)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff", letterSpacing: "0.5px", transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 8px 20px rgba(102,126,234,0.4)",
          }}
        >
          {loading ? "Analyzing Transaction..." : "Check for Fraud"}
        </button>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: "20px", borderRadius: "16px", padding: "20px", textAlign: "center",
            background: isError ? "rgba(113,128,150,0.2)" : isFraud ? "rgba(229,62,62,0.15)" : "rgba(72,187,120,0.15)",
            border: `1px solid ${isError ? "rgba(113,128,150,0.3)" : isFraud ? "rgba(229,62,62,0.4)" : "rgba(72,187,120,0.4)"}`,
          }}>
            {isError ? (
              <div style={{ color: "#a0aec0", fontSize: "1rem" }}>{result.error}</div>
            ) : (
              <>
                <div style={{
                  fontSize: "1.3rem", fontWeight: "800",
                  color: isFraud ? "#fc8181" : "#68d391",
                }}>
                  {isFraud ? "Fraudulent Transaction!" : "Legitimate Transaction"}
                </div>
                <div style={{ color: "#a0aec0", fontSize: "0.9rem", marginTop: "8px" }}>
                  {isFraud
                    ? `Risk Score: ${result.confidence}%`
                    : `Safety Score: ${(100 - result.confidence).toFixed(2)}%`}
                </div>
                {/* Confidence Bar */}
                <div style={{
                  marginTop: "12px", background: "rgba(0,0,0,0.3)",
                  borderRadius: "10px", height: "8px", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: "10px", transition: "width 0.5s",
                    width: `${isFraud ? result.confidence : (100 - result.confidence)}%`,
                    background: isFraud
                      ? "linear-gradient(90deg, #e53e3e, #fc8181)"
                      : "linear-gradient(90deg, #38a169, #68d391)",
                  }} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ color: "#4a5568", fontSize: "0.8rem", marginTop: "25px", textAlign: "center" }}>
        Data processed locally • Never stored • For educational purposes
      </p>
    </div>
  );
}

export default App;
