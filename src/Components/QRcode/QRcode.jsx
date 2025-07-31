import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

function Code() {
  const [result, setResult] = useState(null);
  return (
    <div className="QRcode">
      <div
        style={{
          height: "auto",
          margin: "0 auto",
          maxWidth: 64,
          width: "100%",
        }}
      >
        <QRCode
          size={256}
          style={{ height: "50%", maxWidth: "100%", width: "100%" }}
          value={"type: text, text: hola"}
          viewBox={`0 0 256 256`}
        />
      </div>
      <div style={{ width: "10%", height: "10%" }}>
        <Scanner
          onError={(error) => console.error(error)}
          style={{ width: "10%", height: "10%" }}
          onScan={(result) => {
            if (result) {
              setResult(result[0].rawValue);
              
            }
          }}
        />
      </div>

      <div className="result">
        {result ? (
          <p>
            Resultado:{" "}
            {typeof result === "object"
              ? JSON.stringify(result)
              : String(result)}
          </p>
        ) : (
          <p>Escanea un código QR</p>
        )}
      </div>
    </div>
  );
}
export default Code;
