// frontend-server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = 5500; // Pode mudar se quiser

// Define a pasta do frontend (ajuste se o nome for diferente)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rota padrão
app.get("/", (req, res) => {
  res.redirect("/telaLogin/telaLogin.html");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor do frontend rodando em: http://localhost:${PORT}`);
});
