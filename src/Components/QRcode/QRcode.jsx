import QRCode from "react-qr-code";
;

function Code({codigo}) {

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
          value={codigo}
          viewBox={`0 0 256 256`}
        />
      </div>
     
        
     
    </div>
  );
}
export default Code;
