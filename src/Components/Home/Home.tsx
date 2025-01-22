import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ExtraPage from "../Extra/Extra";
import React from "react";
import CardsCarrusel from "../CardsCarrusel/CardsCarrusel";

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <CardsCarrusel />
      <ExtraPage />
      <Footer />
    </>
  );
};

export default Home;
