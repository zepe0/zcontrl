import React, { useEffect, useState } from "react";

function ClienteSearch({
  clientes,
  onClienteSeleccionado,
  onAddCliente,
  clienteSeleccionado,
}) {
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchValue, setSearchValue] = useState("");

  // Sincroniza el estado del input con el cliente seleccionado
  useEffect(() => {
    if (clienteSeleccionado) {
      setShowTooltip(false); // Oculta el tooltip si hay un cliente seleccionado
    }
  }, [clienteSeleccionado]);

  const handleClienteInput = (e) => {
    const value = e.target.value;
    setSearchValue(value); // Actualiza el estado del input
    if (value.length >= 2) {
      const filtered = clientes.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(value.toLowerCase())
      );
     
      setFilteredClientes(filtered);
      setShowTooltip(true);
      setSelectedIndex(-1);
    } else {
      setFilteredClientes([]);
      setShowTooltip(false); // Oculta el tooltip si no hay resultados
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredClientes.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredClientes[selectedIndex]) {
        const clienteSeleccionado = filteredClientes[selectedIndex];
        onClienteSeleccionado(clienteSeleccionado);
        setShowTooltip(false);
      } else if (filteredClientes.length === 0) {
        onAddCliente(searchValue); // Llama a la función para añadir un cliente nuevo
      }
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="Cliente"
        autoComplete="off"
        value={searchValue} // Vincula el valor al estado
        onChange={handleClienteInput} // Actualiza el estado al escribir
        onKeyDown={handleKeyDown} // Maneja las teclas como Enter y flechas
        onFocus={(e) => {
          if (e.target.value.length >= 2) setShowTooltip(true);
        }}
      />
      {showTooltip && (
        <div className="tooltip">
          {filteredClientes.length > 0 ? (
            <ul>
              {filteredClientes.map((cliente, index) => (
                <li
                  key={cliente.id}
                  className={index === selectedIndex ? "highlight" : ""}
                  onClick={() => {
                    onClienteSeleccionado(cliente);
                    setSearchValue(cliente.nombre); // Actualiza el input con el nombre del cliente
                    setShowTooltip(false);
                  }}
                >
                  {cliente.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <button
                type="button"
                className="add-client-button"
                onClick={() => onAddCliente(searchValue)}
              >
                ✙ Nuevo
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ClienteSearch;
