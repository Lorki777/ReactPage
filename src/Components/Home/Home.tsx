// src/components/Home.tsx
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ExtraPage from "../Extra/Extra";
import React, { useEffect, useState } from "react";

// Interfaz para tipar los datos
interface Producto {
  TourName: string;
  TourInfo: string;
}

// Estilos en línea
const styles = {
  cardsContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "1rem",
    justifyContent: "center",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    width: "200px",
    textAlign: "center" as const,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
};

const Home: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]); // Estado para los datos
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Función para obtener los datos del backend
  const fetchProductos = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/productos");
      if (!response.ok) throw new Error("Error al obtener los datos");

      const data: Producto[] = await response.json(); // Tipar los datos
      setProductos(data); // Actualizar el estado con los datos
    } catch (err) {
      console.error("Error:", err);
      setError("Error al obtener los datos del servidor.");
    }
  };

  // Hook useEffect: Llama a la función al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);
  return (
    <>
      <Header />
      <h1>Bienvenido a la Página Principal</h1>
      <p>Este es el contenido de la página principal.</p>
      <div>
        <h1>Tourname</h1>

        {/* Mostrar error si ocurre */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Renderizar las tarjetas */}
        <div style={styles.cardsContainer}>
          {productos.map((producto) => (
            <div key={producto.TourName} style={styles.card}>
              <h3>{producto.TourInfo}</h3>
              <p>Tourname: {producto.TourName}</p>
            </div>
          ))}
        </div>
      </div>
      <ExtraPage />
      <Footer />
    </>
  );
};

export default Home;
