import React, { useState, useEffect } from "react";
import "./Payment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { IoIosContacts } from "react-icons/io";
import { RiFileList3Line } from "react-icons/ri";
import { formatDate } from "../Hook";
import { Traveler } from "../Interfaces";

const Payment: React.FC = () => {
  const [billing, setBilling] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "tarjeta">(
    "transferencia"
  );

  // Estado para los datos de contacto (fuera de los viajeros)
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

  // Estado para los datos de facturación
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

  // Estado para la información de reserva
  const [bookingInfo, setBookingInfo] = useState<{
    date?: string;
    departure?: string;
    schedule?: string;
    adultos?: number;
    ninos?: number;
    cantidad?: number;
    tourname?: string;
    tourslug?: string;
    tourprice?: string;
  }>({});

  // Estado para manejar los datos de cada viajero
  const [travelers, setTravelers] = useState<Traveler[]>([]);

  // Lee la información de reserva desde localStorage
  useEffect(() => {
    const storedBooking = localStorage.getItem("bookingInfo");
    if (storedBooking) {
      const parsedBooking = JSON.parse(storedBooking);
      setBookingInfo(parsedBooking);

      // Determina cuántos adultos hay; si no hay o es 0, se usa al menos 1
      const numAdults =
        parsedBooking.adultos && parsedBooking.adultos > 0
          ? parsedBooking.adultos
          : 1;

      // Genera un array de viajeros, cada uno con campos vacíos
      const generatedTravelers = Array.from({ length: numAdults }, () => ({
        title: "Mr",
        firstName: "",
        lastName: "",
      }));

      setTravelers(generatedTravelers);
    }
  }, []);

  // Maneja cambios en cada viajero
  const handleTravelerChange = (
    index: number,
    field: keyof Traveler,
    value: string
  ) => {
    setTravelers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Manejar cambios en los inputs de contacto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar cambios en los inputs de facturación
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingData({ ...billingData, [e.target.name]: e.target.value });
  };

  // Copia automáticamente los datos de contacto a facturación si billing está activado
  useEffect(() => {
    if (billing) {
      setBillingData((prev) => ({
        ...prev,
        ...formData,
      }));
    }
  }, [billing, formData]);

  // Simular envío de formulario
  const handleSubmit = () => {
    const payload = {
      contacto: formData,
      facturacion: billing ? billingData : null,
      viajeros: travelers, // Aquí agregamos el array de viajeros
    };
    console.log("Enviando datos:", payload);
    setFormSubmitted(true);
  };

  const showNinos = bookingInfo.ninos !== undefined && bookingInfo.ninos !== 0;
  const showCantidad =
    bookingInfo.cantidad !== undefined && bookingInfo.cantidad !== 0;
  // Calcular el colSpan para las filas de Subtotal y Total: se cuentan todas las columnas menos la de Totales.
  const colSpan = 2 + (showNinos ? 1 : 0) + (showCantidad ? 1 : 0);

  return (
    <>
      <Header />
      <div className="payment-header">
        <h1>{bookingInfo.tourname}</h1>
        <div className="payment-steps-bar">
          <div className="payment-steps2-bar">
            <div className="step-item completed">Seleccionar viaje</div>
            <div className="step-item active">2. Detalles de contacto</div>
            <div className="step-item">3. Pago</div>
            <div className="step-item">4. Completar</div>
          </div>
        </div>
      </div>

      <div className="payment-container">
        <div className="payment-form">
          {!formSubmitted ? (
            <>
              <h3>
                <IoIosContacts /> Datos del viajero
              </h3>

              {/* Generar dinámicamente los formularios para cada viajero */}
              {travelers.map((traveler, index) => (
                <div className="payment-traveler" key={index}>
                  <label>Viajero {index + 1}</label>
                  <select
                    value={traveler.title}
                    onChange={(e) =>
                      handleTravelerChange(index, "title", e.target.value)
                    }
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={traveler.firstName}
                    onChange={(e) =>
                      handleTravelerChange(index, "firstName", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Apellido *"
                    value={traveler.lastName}
                    onChange={(e) =>
                      handleTravelerChange(index, "lastName", e.target.value)
                    }
                  />
                </div>
              ))}

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
                      onClick={() =>
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
                        })
                      }
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
            </>
          ) : mostrarTabla ? (
            <>
              <table className="payment-table-resume">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Adultos</th>
                    {showNinos && <th>Niños</th>}
                    {showCantidad && <th>Cantidad</th>}
                    <th>Totales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{bookingInfo.tourname}</td>
                    <td>{bookingInfo.adultos || 1}</td>
                    {showNinos && <td>{bookingInfo.ninos}</td>}
                    {showCantidad && <td>{bookingInfo.cantidad}</td>}
                    <td>${bookingInfo.tourprice}</td>
                  </tr>
                  <tr>
                    <td colSpan={colSpan}>
                      <strong>Subtotal:</strong>
                    </td>
                    <td>
                      <strong>${bookingInfo.tourprice}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={colSpan}>
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>${bookingInfo.tourprice}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="Separadortypeofpayment">
                <label className="typeofpayment">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="transferencia"
                    checked={metodoPago === "transferencia"}
                    onChange={() => setMetodoPago("transferencia")}
                  />
                  <strong style={{ marginLeft: "8px" }}>
                    Transferencia bancaria directa
                  </strong>
                </label>

                <label className="typeofpayment">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="tarjeta"
                    checked={metodoPago === "tarjeta"}
                    onChange={() => setMetodoPago("tarjeta")}
                  />
                  <strong style={{ marginLeft: "8px" }}>
                    Tarjetas de crédito/débito
                  </strong>
                </label>
              </div>

              {metodoPago === "transferencia" && (
                <div
                  style={{
                    backgroundColor: "#eae6f9",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <p>
                    <strong>
                      Instrucciones para Depósito o Transferencia Bancaria
                    </strong>
                  </p>
                  <ol>
                    <li>
                      Comienza tu reserva: Haz el depósito o transferencia
                      bancaria usando tu <strong>número de pedido</strong> como
                      referencia.
                    </li>
                    <li>
                      Plazo máximo de pago: Tienes 3 días hábiles para completar
                      el pago. Todos los paquetes están sujetos a disponibilidad
                      hasta recibir el pago.
                    </li>
                    <li>
                      Envíanos tu comprobante: Envía un correo
                      contacto@stagingapp11074.cloudwayssites.com con tu{" "}
                      <strong>nombre y número de pedido el comprobante</strong>,
                      si eres un usuario de nuestra plataforma, omite este paso
                      y adjunta el comprobante en el apartado de Mis reservas.
                    </li>
                    <li>
                      Confirmación: Una vez verificado el pago, te enviaremos la
                      confirmación de tu reservación.
                    </li>
                  </ol>
                </div>
              )}

              {metodoPago === "tarjeta" && (
                <div
                  style={{
                    backgroundColor: "#eae6f9",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Número de tarjeta"
                      style={{ flex: 2 }}
                    />
                    <input
                      type="text"
                      placeholder="MM / AA"
                      style={{ flex: 1 }}
                    />
                    <input type="text" placeholder="CVC" style={{ flex: 1 }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                </div>
              )}
              <button
                className="form-button"
                style={{ backgroundColor: "#0056b3" }}
              >
                PAGAR POR EL PEDIDO
              </button>
            </>
          ) : (
            <div className="payment-summary">
              <h3>
                <IoIosContacts /> Detalles de contacto
              </h3>
              <p>
                <strong>Nombre:</strong> {formData.nombre}
              </p>
              <p>
                <strong>Apellidos:</strong> {formData.apellido}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {formData.telefono}
              </p>
              <p>
                <strong>País:</strong> {formData.pais}
              </p>
              <p>
                <strong>Estado:</strong> {formData.estado}
              </p>
              <p>
                <strong>Ciudad:</strong> {formData.ciudad}
              </p>
              <p>
                <strong>Código Postal:</strong> {formData.codigoPostal}
              </p>
              <p>
                <strong>Dirección:</strong> {formData.direccion}
              </p>

              {billing && (
                <>
                  <h3>
                    <RiFileList3Line /> Detalles de facturación
                  </h3>
                  <p>
                    <strong>Nombre:</strong> {billingData.nombre}
                  </p>
                  <p>
                    <strong>Apellidos:</strong> {billingData.apellido}
                  </p>
                  <p>
                    <strong>Email:</strong> {billingData.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {billingData.telefono}
                  </p>
                  <p>
                    <strong>País:</strong> {billingData.pais}
                  </p>
                  <p>
                    <strong>Estado:</strong> {billingData.estado}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {billingData.ciudad}
                  </p>
                  <p>
                    <strong>Código Postal:</strong> {billingData.codigoPostal}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {billingData.direccion}
                  </p>
                </>
              )}

              <div className="payment-options">
                <p>
                  <strong>Por favor, seleccione un método de pago</strong>
                </p>
                <button
                  className="form-button"
                  onClick={() => {
                    setMostrarTabla(true);
                  }}
                >
                  Pagar Ahora
                </button>

                <button
                  className="form-button"
                  onClick={() => {
                    console.log(
                      "Función de reservar sin pagar aún no implementada."
                    );
                  }}
                >
                  Reservar y Pagar Después
                </button>
                <div className="terminosyaviso">
                  <input type="checkbox" id="terminos" />
                  <label htmlFor="terminos">
                    * Estoy de acuerdo con las{" "}
                    <a href="/Terminos">Condiciones del servicio</a> y la{" "}
                    <a href="/Aviso">Política de privacidad</a>.
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar con la info de la reserva (opcional) */}
        <aside className="payment-sidebar">
          <h3 className="payment-sidebar-title">Información de la Reserva</h3>
          {bookingInfo && (
            <div className="booking-info">
              {bookingInfo.date && bookingInfo.date !== "" && (
                <p>
                  <strong>Fecha:</strong> {formatDate(bookingInfo.date)}
                </p>
              )}
              {bookingInfo.departure && bookingInfo.departure !== "" && (
                <p>
                  <strong>Salida desde:</strong> {bookingInfo.departure}
                </p>
              )}
              {bookingInfo.schedule && bookingInfo.schedule !== "" && (
                <p>
                  <strong>Horario:</strong> {bookingInfo.schedule}
                </p>
              )}
              {bookingInfo.adultos !== undefined &&
                bookingInfo.adultos !== 0 && (
                  <p>
                    <strong>Adultos:</strong> {bookingInfo.adultos}
                  </p>
                )}
              {bookingInfo.ninos !== undefined && bookingInfo.ninos !== 0 && (
                <p>
                  <strong>Niños:</strong> {bookingInfo.ninos}
                </p>
              )}
              {bookingInfo.cantidad !== undefined &&
                bookingInfo.cantidad !== 0 && (
                  <p>
                    <strong>Cantidad:</strong> {bookingInfo.cantidad}
                  </p>
                )}
            </div>
          )}
        </aside>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
