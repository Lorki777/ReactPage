import React from "react";
import "./Payment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { IoIosContacts } from "react-icons/io";
import { RiFileList3Line } from "react-icons/ri";

const Payment: React.FC = () => {
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
          <h3>
            <RiFileList3Line /> Detalles de contacto y Factuarion
          </h3>
          <input type="text" placeholder="Nombre *" />
          <input type="text" placeholder="Apellido *" />
          <input type="text" placeholder="Email *" />
          <input type="text" placeholder="Telefono *" />
          <input type="text" placeholder="Pais *" />
          <input type="text" placeholder="Estado *" />
          <input type="text" placeholder="Ciudad *" />
          <input type="text" placeholder="Codigo Postal *" />
          <input type="text" placeholder="Direccion *" />
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
