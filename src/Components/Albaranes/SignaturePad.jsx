import React, { useRef } from "react";

function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL(); // Convierte la firma a una imagen base64
    onSave(dataURL); // Envía la firma al componente padre
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{
          border: "1px solid #ccc",
          display: "block",
          margin: "10px 0",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
      <button type="button" onClick={clearCanvas}>
        Limpiar
      </button>
      <button type="button" onClick={saveSignature}>
        Guardar Firma
      </button>
    </div>
  );
}

export default SignaturePad;