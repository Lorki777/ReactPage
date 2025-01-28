import React from "react";
import "./Tours.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const ToursPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="tourspageheader">
        <h1>Tours </h1>
      </div>
      <p>esto es la pagina de tourspage</p>
      <Footer />
    </>
  );
};

export default ToursPage;
