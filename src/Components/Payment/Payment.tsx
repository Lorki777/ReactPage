import React, { useState, useEffect } from "react";
import "./Payment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { IoIosContacts } from "react-icons/io";
import { RiFileList3Line } from "react-icons/ri";

const Payment: React.FC = () => {
  const [billing, setBilling] = useState(false);

  // Estado para los datos de contacto
  const [formData, setFormData] = useState<{ [key: string]: string }>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    pais: "",
    estado: "",
    ciudad: "",
    codigoPostal: "",
    direccion: "",
  });

  // Estado para los datos de facturación (se inicia vacío o con los mismos valores)
  const [billingData, setBillingData] = useState<{ [key: string]: string }>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    pais: "",
    estado: "",
    ciudad: "",
    codigoPostal: "",
    direccion: "",
  });

  // Manejar cambios en los inputs de contacto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar cambios en los inputs de facturación
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingData({ ...billingData, [e.target.name]: e.target.value });
  };

  // Simular envío de formulario
  const handleSubmit = () => {
    const payload = {
      contacto: formData,
      facturacion: billing ? billingData : null, // Solo enviar facturación si está habilitada
    };
    console.log("Enviando datos:", payload);
  };

  // Copia automáticamente los datos de contacto a facturación si billing está activado
  useEffect(() => {
    if (billing) {
      setBillingData((prevBillingData) => ({
        ...prevBillingData,
        ...formData,
      }));
    }
  }, [billing, formData]);

  return (
    <>
      <Header />
      <div className="payment-header">
        <h1>TURQUÍA Y DUBÁI</h1>

        {/* La barra de pasos debe estar dentro del header */}
        <div className="payment-steps-bar">
          <div className="payment-steps2-bar">
            <div className="step-item completed">✔ Seleccionar viaje</div>
            <div className="step-item active">2. Detalles de contacto</div>
            <div className="step-item">3. Pago</div>
            <div className="step-item">4. Completar</div>
          </div>
        </div>
      </div>

      <div className="payment-container">
        <div className="payment-form">
          <h3>
            <IoIosContacts /> Datos del viajero
          </h3>
          <div className="payment-traveler">
            <label>Viajero 1</label>
            <select>
              <option>Mr</option>
              <option>Ms</option>
            </select>
            <input type="text" placeholder="Nombre *" />
            <input type="text" placeholder="Apellido *" />
          </div>
          <div className="payment-traveler">
            <label>Viajero 2</label>
            <select>
              <option>Mr</option>
              <option>Ms</option>
            </select>
            <input type="text" placeholder="Nombre *" />
            <input type="text" placeholder="Apellido *" />
          </div>
          <div className="form-container">
            <h3 className="form-title">
              <RiFileList3Line />
              Detalles de contacto
            </h3>
            <div className="form-grid">
              {Object.keys(formData).map((key) => (
                <div className="floating-group" key={key}>
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="floating-input"
                    required
                  />
                  <label
                    className={`floating-label ${
                      formData[key] ? "focused" : ""
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBilling(!billing)}
              className="form-button"
            >
              {billing ? "Ocultar Facturación" : "¿Deseas facturar?"}
            </button>

            {billing && (
              <div className="billing-section">
                <h3 className="form-title">
                  <RiFileList3Line />
                  Detalles de Facturación
                </h3>
                <button
                  onClick={() => {
                    setBilling(!billing);
                    if (billing) {
                      setBillingData({
                        nombre: "",
                        apellido: "",
                        email: "",
                        telefono: "",
                        pais: "",
                        estado: "",
                        ciudad: "",
                        codigoPostal: "",
                        direccion: "",
                      });
                    }
                  }}
                  className="form-button"
                >
                  Tienes otros datos de facturación
                </button>
                <div className="form-grid">
                  {Object.keys(billingData).map((key) => (
                    <div className="floating-group" key={`billing-${key}`}>
                      <input
                        type="text"
                        name={key}
                        value={billingData[key]}
                        onChange={handleBillingChange}
                        className="floating-input"
                        required
                      />
                      <label
                        className={`floating-label ${
                          billingData[key] ? "focused" : ""
                        }`}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleSubmit} className="form-button">
              Enviar
            </button>
          </div>
        </div>

        <aside className="payment-sidebar">
          <h3 className="payment-sidebar-title">TURQUÍA Y DUBÁI</h3>
          <p className="payment-date">
            Fecha del viaje: <span>mayo 8, 2025</span> (<a href="#">Editar</a>)
          </p>
          <p>
            Viajero: <span>2</span>
          </p>
          <input type="text" placeholder="Código del cupón" />
          <button className="apply-coupon">Aplicar</button>
          <a href="#" className="price-breakdown">
            Ver desglose de precios
          </a>
          <p className="payment-price">
            Precio total: <span>$139,980.00</span>
          </p>
          <button className="payment-next-button">SIGUIENTE PASO</button>
        </aside>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
