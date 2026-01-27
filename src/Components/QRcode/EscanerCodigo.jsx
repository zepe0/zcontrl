import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/browser";

const formats = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8, 
  BarcodeFormat.CODE_128,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
  BarcodeFormat.CODE_39,
];

function EscanerCodigo({ onScan, onError }) {
  const videoRef = useRef(null);
  const scannedRef = useRef(false);
  const stopControlsRef = useRef(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error, controls) => {
          stopControlsRef.current = controls;

          if (!scannedRef.current && result) {
            scannedRef.current = true;
            controls.stop();
            onScan(result.getText());
          } else if (error) {
            // Ignorar NotFoundException para no llenar consola
            if (error.name !== "NotFoundException") {
              if (onError) onError(error);
            }
          }
        },
        { formats, tryHarder: true } // activa tryHarder aquí
      )
      .catch((err) => {
        if (err.name === "AbortError") {
          // No mostrar nada para AbortError
        } else {
          console.error("Error iniciando cámara:", err);
        }
      });

    return () => {
      if (stopControlsRef.current) {
        stopControlsRef.current.stop();
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      style={{
        width: "100%",
        height: "auto",
        borderRadius: "8px",
        objectFit: "cover",
      }}
      muted
      playsInline
      autoPlay
    />
  );
}

export default EscanerCodigo;
