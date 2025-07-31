import React from 'react';

const Loader = () => (
    <div style={styles.container}>
        <div style={styles.spinner}></div>
        <span style={styles.text}>Cargando...</span>
    </div>
);

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100px',
        zIndex: 1000,
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #ccc',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '10px',
    },
    text: {
        color: '#555',
        fontSize: '16px',
    },
};

// Keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
}
`;
document.head.appendChild(styleSheet);

export default Loader;