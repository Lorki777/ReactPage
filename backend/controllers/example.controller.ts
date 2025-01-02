import express from "express";

export const getExample = (_: express.Request, res: express.Response) => {
  try {
    const largeResponse =
      "Hola desde el backend con TypeScript alaaaaaa!".repeat(100);
    res.json({ message: largeResponse });
  } catch (error) {
    console.error("Error en getExample:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};
