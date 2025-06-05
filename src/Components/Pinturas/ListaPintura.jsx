
function LisatPintura({ pinturas }) {
  return (
    <div className="left">
      {pinturas ? (
        pinturas.map((pintura) => (
          <ul className="pintura" key={pintura.id}>
            <li className={`RAL-${pintura.ral} circuloRal`}></li>

            <li className={pintura.stock <= 0
                ? "red alingl"
                : pintura.stock < 10
                ? "alingl yellow"
                : "alingl"}>{pintura.ral}</li>
            <li className={pintura.stock <= 0
                ? "red alingl"
                : pintura.stock < 10
                ? "alingl yellow"
                : "alingl"} >
              {pintura.marca.lengle > 7
                ? `${pintura.marca.substring(0, 7)}...`
                : pintura.marca}
            </li>

            <li className={pintura.stock <= 0
                ? "red alingl"
                : pintura.stock < 10
                ? "alingl yellow"
                : "alingl"}>
              {pintura.stock} Kg
            </li>
          </ul>
        ))
      ) : (
        <p>Añada pinturas para controlar stock</p>
      )}
    </div>
  );
}
export default LisatPintura;
