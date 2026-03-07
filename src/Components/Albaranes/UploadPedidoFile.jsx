import React, { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UploadPedidoFile.css";

function UploadPedidoFile({ onDataExtracted }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // helper for toast with optional expandable details
  const showErrorWithDetail = (msg, detail) => {
    if (detail) {
      const ToastContent = () => {
        const [expanded, setExpanded] = useState(false);
        return (
          <div>
            <div>{msg}</div>
            <div>
              <button
                onClick={() => setExpanded((e) => !e)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: "4px",
                  fontSize: "0.85rem",
                }}
              >
                {expanded ? "Ocultar detalles" : "Ver más detalles"}
              </button>
            </div>
            {expanded && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  marginTop: "4px",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                {detail}
              </pre>
            )}
          </div>
        );
      };
      toast.error(<ToastContent />);
    } else {
      toast.error(msg);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Verificar tipo de archivo
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";

      if (!isImage && !isPDF) {
        toast.error("Por favor, selecciona una imagen o un PDF");
        setLoading(false);
        return;
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("file", file);

      // Enviar al servidor para procesamiento
      const API = import.meta.env.VITE_API || "localhost";
      const response = await fetch(`${API}/api/pedidos/upload`, {
        method: "POST",
        body: formData,
      });

      // even if status is 400/422, server might include JSON body with `error`
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // not JSON, treat as generic failure
        if (!response.ok) {
          throw new Error(
            `Error al procesar el archivo (status ${response.status})`,
          );
        }
      }

      if (!response.ok) {
        // if server returned an error object, use it, otherwise generic
        if (data && data.error) {
          if (
            data.error ===
            "No se pudo extraer el nombre del cliente del documento"
          ) {
            // Mostrar advertencia pero proceder: enviar los datos para revisión
            const detail = data.text || "";
            showErrorWithDetail(
              "No se pudo extraer el nombre del cliente del documento. Revisa y completa el campo en la revisión.",
              detail,
            );
            if (onDataExtracted) {
              console.log("Datos extraídos (con advertencia):", data);
              onDataExtracted(data);
              toast.success("Datos del pedido extraídos (con advertencia)");
            }
            setLoading(false);
            return;
          }
          const detail = data.text || "";
          showErrorWithDetail(data.error, detail);
        } else {
          throw new Error(
            `Error al procesar el archivo (status ${response.status})`,
          );
        }
        setLoading(false);
        return;
      }

      if (data && data.error) {
        const detail = data.text || "";
        showErrorWithDetail(data.error, detail);
        setLoading(false);
        return;
      }

      // Llamar la función callback con los datos extraídos
      if (onDataExtracted) {
        console.log("Datos extraídos recibidos:", data);
        onDataExtracted(data);
        toast.success("Datos del pedido extraídos");
      }
    } catch (error) {
      console.error("UploadPedidoFile error:", error);
      toast.error("Error al procesar el archivo: " + error.message);
    } finally {
      setLoading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick={true}
        pauseOnHover={false}
        draggable={true}
        progress={false}
        style={{ zIndex: 20000 }}
      />
      <div className="upload-pedido-container">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          disabled={loading}
          className="upload-file-input"
          aria-label="Cargar pedido desde archivo"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="upload-btn"
          title="Cargar pedido desde PDF o imagen"
        >
          {loading ? "Procesando..." : "📄 Cargar desde archivo"}
        </button>
      </div>
    </>
  );
}

export default UploadPedidoFile;
