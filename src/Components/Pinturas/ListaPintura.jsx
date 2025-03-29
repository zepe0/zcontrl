function LisatPintura({ pinturas }) {
  return (
    <div className="left">
      {pinturas ? (
        pinturas.map((pintura) => (
          <ul className="pintura" key={pintura.id}>
            <li
              className={`${pintura.ral.replace(/\s+/g, "-")} circuloRal`}
            ></li>

            <li className="alingl">
              {pintura.ral.replace(/RAL\s*/i, "").replace(/\s+/g, "-")}
            </li>
            <li className="alingl">
              {pintura.marca.lengle > 7
                ? `${pintura.marca.substring(0, 7)}...`
                : pintura.marca}
            </li>

            <li className="alinl">{pintura.stock} Kg</li>
          </ul>
        ))
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
export default LisatPintura;
