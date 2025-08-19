import { useState } from "react";
import "./Nave.css";
import APinturas from "../Movil/Apinturas";

function Nave() {
  const [Lista, SetLista] = useState(false);
  return (
    <div className="nave-plano">
   
      <div className="plano">
        <div onClick={() => SetLista("proceso")} className="zona pro">
        Proceso
        </div>
        <div onClick={() => SetLista("acabado")} className="zona acabado">
          Acabado
        </div>
        <div onClick={() => SetLista("Lavado")} className="zona laser">
         Laser
        </div>
        <div
          onClick={() => SetLista("APintura")}
          className="zona almacen-pintura"
        >
          Almacenaje Pintura
        </div>
        <div
          onClick={() => SetLista("AProductos")}
          className="zona almacen-productos"
        >
          Almacenaje Productos
        </div>
        <div onClick={() => SetLista("Zinc")} className="zona zinc">
          Zinc
        </div>
      </div>
      {Lista  && Lista === "APintura" ?(
        <div className="lista-prioridades">
        <APinturas />
        </div>
      ): null}
    </div>
  );
}

export default Nave;
