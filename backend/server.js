// ===========================================
// ARQUIVO: server.js (FINAL BLINDADO)
// ===========================================

import express from "express";
import cors from "cors";
import pg from "pg";
import crypto from 'crypto';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

// --- SERVIR O FRONTEND ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
  res.redirect('/telaLogin/telaLogin.html');
});

// --- CONEXÃO COM O POSTGRES ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar ao PostgreSQL:", err.message));

// ----------------------------------------------------
// ROTAS DE AUTENTICAÇÃO
// ----------------------------------------------------

// CADASTRO
app.post("/usuarios", async (req, res) => {
  try {
    const { email, username, senha } = req.body;
    if (!email || !username || !senha) {
       return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }
    // Insere apenas o básico no cadastro
    const result = await pool.query(
      "INSERT INTO usuarios (email, username, senha) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, username, senha] 
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: "Este email já está cadastrado." });
    }
    res.status(500).json({ erro: "Erro ao cadastrar utilizador" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }
    const result = await pool.query(
      "SELECT id, email, username FROM usuarios WHERE email = $1 AND senha = $2", 
      [email, senha]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos." });
    }
    const usuario = result.rows[0];
    res.status(200).json({ usuario });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// RECUPERAÇÃO DE SENHA
app.post("/forgot-password", async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) return res.status(400).json({ erro: "Dados incompletos." });

    const userQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1 AND username = $2", [email, username]);
    if (userQuery.rows.length === 0) return res.status(404).json({ erro: "Usuário não encontrado." });

    const token = crypto.randomBytes(4).toString('hex').toUpperCase(); 
    const expires = new Date(Date.now() + 600000); 

    await pool.query("UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE email = $3", [token, expires, email]);
    console.log(`[RESET TOKEN]: ${token}`); 
    res.status(200).json({ mensagem: "Token gerado no console." });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno." });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { token, senha } = req.body; 
    const userQuery = await pool.query("SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()", [token]);
    if (userQuery.rows.length === 0) return res.status(400).json({ erro: "Token inválido." });

    await pool.query("UPDATE usuarios SET senha = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2", [senha, userQuery.rows[0].id]);
    res.status(200).json({ mensagem: "Senha alterada." });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno." });
  }
});

// ----------------------------------------------------
// ROTAS DE PERFIL (GET E PUT)
// ----------------------------------------------------

// GET: Busca TODOS os dados
app.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, email, username, data_nascimento, genero, cpf FROM usuarios WHERE id = $1",
      [parseInt(id, 10)]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: "Não encontrado." });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dados." });
  }
});

// PUT: Atualiza TODOS os dados (Com proteção contra dados vazios)
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, senha, data_nascimento, genero, cpf } = req.body;
    const userId = parseInt(id, 10);

    // --- PROTEÇÃO CONTRA ERRO 500 ---
    // Converte strings vazias em NULL para o banco não reclamar da data
    const dataFinal = (!data_nascimento || data_nascimento === "") ? null : data_nascimento;
    const generoFinal = (!genero || genero === "") ? null : genero;
    const cpfFinal = (!cpf || cpf === "") ? null : cpf;

    // Se enviou senha, atualiza tudo. Se não, mantém a senha antiga.
    if (senha && senha.trim() !== "") {
        await pool.query(
            "UPDATE usuarios SET username=$1, email=$2, senha=$3, data_nascimento=$4, genero=$5, cpf=$6 WHERE id=$7",
            [username, email, senha, dataFinal, generoFinal, cpfFinal, userId]
        );
    } else {
        await pool.query(
            "UPDATE usuarios SET username=$1, email=$2, data_nascimento=$3, genero=$4, cpf=$5 WHERE id=$6",
            [username, email, dataFinal, generoFinal, cpfFinal, userId]
        );
    }
    res.status(200).json({ mensagem: "Dados atualizados!" });
  } catch (err) {
    console.error("Erro no PUT:", err.message); // Mostra erro no terminal
    if (err.code === '23505') return res.status(409).json({ erro: "Email em uso." });
    res.status(500).json({ erro: "Erro ao atualizar: " + err.message });
  }
});

// ----------------------------------------------------
// ROTAS DE VÍDEOS
// ----------------------------------------------------
app.get("/videos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar vídeos" });
  }
});

app.get("/videos/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos WHERE id = $1", [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Vídeo não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar o vídeo" });
  }
});

const PORT = 3001; 
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));