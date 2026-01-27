
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

function ScannerQR() {
  const [result, setResult] = useState(null);
  return (
    
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
        {result && (
          <div>
            <p>Resultado: {result}</p>
            <button onClick={() => setResult(null)}>Escanear de nuevo</button>
          </div>
        )}
  
    </div>
  );
}
export default ScannerQR;
