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
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DE E-MAIL ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- SERVIR O FRONTEND ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
  res.redirect('/telaInicial/telaInicial.html');
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

// ----------------------------------------------------
// ROTAS DE INTERAÇÕES (CURTIR / FAVORITAR)
// ----------------------------------------------------

// Buscar estado da interação do usuário em um vídeo
app.get("/videos/:id/interacao/:usuarioId", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const usuarioId = parseInt(req.params.usuarioId, 10);

    const result = await pool.query(
      `SELECT curtido, favoritado
       FROM video_interacoes
       WHERE video_id = $1 AND usuario_id = $2`,
      [videoId, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.json({ curtido: false, favoritado: false });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar interação:", err.message);
    res.status(500).json({ erro: "Erro ao buscar interação." });
  }
});

// Curtir / descurtir
app.post("/videos/:id/curtir", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado." });
    }

    const existe = await pool.query(
      `SELECT curtido, favoritado
       FROM video_interacoes
       WHERE video_id = $1 AND usuario_id = $2`,
      [videoId, usuarioId]
    );

    if (existe.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO video_interacoes (video_id, usuario_id, curtido, favoritado)
         VALUES ($1, $2, TRUE, FALSE)
         RETURNING curtido, favoritado`,
        [videoId, usuarioId]
      );

      return res.json(insert.rows[0]);
    }

    const novoCurtido = !existe.rows[0].curtido;

    const update = await pool.query(
      `UPDATE video_interacoes
       SET curtido = $1
       WHERE video_id = $2 AND usuario_id = $3
       RETURNING curtido, favoritado`,
      [novoCurtido, videoId, usuarioId]
    );

    res.json(update.rows[0]);
  } catch (err) {
    console.error("Erro ao curtir vídeo:", err.message);
    res.status(500).json({ erro: "Erro ao curtir vídeo." });
  }
});

// Favoritar / desfavoritar
app.post("/videos/:id/favoritar", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado." });
    }

    const existe = await pool.query(
      `SELECT curtido, favoritado
       FROM video_interacoes
       WHERE video_id = $1 AND usuario_id = $2`,
      [videoId, usuarioId]
    );

    if (existe.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO video_interacoes (video_id, usuario_id, curtido, favoritado)
         VALUES ($1, $2, FALSE, TRUE)
         RETURNING curtido, favoritado`,
        [videoId, usuarioId]
      );

      return res.json(insert.rows[0]);
    }

    const novoFavoritado = !existe.rows[0].favoritado;

    const update = await pool.query(
      `UPDATE video_interacoes
       SET favoritado = $1
       WHERE video_id = $2 AND usuario_id = $3
       RETURNING curtido, favoritado`,
      [novoFavoritado, videoId, usuarioId]
    );

    res.json(update.rows[0]);
  } catch (err) {
    console.error("Erro ao favoritar vídeo:", err.message);
    res.status(500).json({ erro: "Erro ao favoritar vídeo." });
  }
});

// ----------------------------------------------------
// ROTAS DE COMENTÁRIOS
// ----------------------------------------------------

// Buscar comentários de um vídeo
app.get("/videos/:id/comentarios", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);

    const result = await pool.query(
      `SELECT 
          c.id,
          c.texto,
          c.data_criacao,
          u.username
       FROM comentarios c
       INNER JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.video_id = $1
       ORDER BY c.data_criacao ASC`,
      [videoId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar comentários:", err.message);
    res.status(500).json({ erro: "Erro ao buscar comentários." });
  }
});

// Salvar novo comentário
app.post("/videos/:id/comentarios", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id, 10);
    const { usuarioId, texto } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado." });
    }

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ erro: "Comentário vazio." });
    }

    const result = await pool.query(
      `INSERT INTO comentarios (video_id, usuario_id, texto)
       VALUES ($1, $2, $3)
       RETURNING id, video_id, usuario_id, texto, data_criacao`,
      [videoId, usuarioId, texto.trim()]
    );

    const comentario = result.rows[0];

    const usuario = await pool.query(
      `SELECT username FROM usuarios WHERE id = $1`,
      [usuarioId]
    );

    res.status(201).json({
      ...comentario,
      username: usuario.rows[0]?.username || "Usuário"
    });
  } catch (err) {
    console.error("Erro ao salvar comentário:", err.message);
    res.status(500).json({ erro: "Erro ao salvar comentário." });
  }
});

// ----------------------------------------------------
// ROTAS DE CONTATO / CENTRAL DE AJUDA
// ----------------------------------------------------

app.post("/contato", async (req, res) => {
  try {
    const { nome, email, tipo, mensagem } = req.body;
    if (!nome || !email || !tipo || !mensagem) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    await pool.query(
      "INSERT INTO mensagens_contato (nome, email, tipo, mensagem) VALUES ($1, $2, $3, $4)",
      [nome.trim(), email.trim(), tipo, mensagem.trim()]
    );

    // Envia e-mail de notificação em segundo plano (não bloqueia a resposta)
    transporter.sendMail({
      from: `"TecnoSenior" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      subject: `[TecnoSenior] ${tipo} — ${nome.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #ddd;border-radius:8px">
          <h2 style="color:#24483e;margin-top:0">Nova mensagem recebida</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <tr><td style="padding:6px 0;color:#555;width:120px"><strong>Nome:</strong></td><td>${nome.trim()}</td></tr>
            <tr><td style="padding:6px 0;color:#555"><strong>E-mail:</strong></td><td><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            <tr><td style="padding:6px 0;color:#555"><strong>Tipo:</strong></td><td>${tipo}</td></tr>
          </table>
          <div style="background:#f4f6f8;border-radius:6px;padding:16px;white-space:pre-wrap;font-size:15px;color:#333">${mensagem.trim()}</div>
          <p style="margin-top:16px;font-size:12px;color:#999">Acesse o <a href="http://localhost:3001/telaAdmin/telaAdmin.html">painel administrativo</a> para visualizar todas as mensagens.</p>
        </div>
      `,
    }).catch((err) => console.error("Erro ao enviar e-mail:", err.message));

    res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar contato:", err.message);
    res.status(500).json({ erro: "Erro ao enviar mensagem." });
  }
});

// ----------------------------------------------------
// ROTAS DO PAINEL ADMIN
// ----------------------------------------------------

app.get("/admin/mensagens", async (req, res) => {
  try {
    const { tipo, lida } = req.query;
    let query = "SELECT * FROM mensagens_contato";
    const params = [];
    const conditions = [];

    if (tipo) {
      params.push(tipo);
      conditions.push(`tipo = $${params.length}`);
    }
    if (lida !== undefined) {
      params.push(lida === "true");
      conditions.push(`lida = $${params.length}`);
    }
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY data_envio DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar mensagens:", err.message);
    res.status(500).json({ erro: "Erro ao buscar mensagens." });
  }
});

app.patch("/admin/mensagens/:id/lida", async (req, res) => {
  try {
    const { id } = req.params;
    const { lida } = req.body;
    const result = await pool.query(
      "UPDATE mensagens_contato SET lida = $1 WHERE id = $2 RETURNING *",
      [lida, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ erro: "Mensagem não encontrada." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar mensagem:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar mensagem." });
  }
});

app.delete("/admin/mensagens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM mensagens_contato WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: "Mensagem não encontrada." });
    res.json({ mensagem: "Mensagem excluída com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir mensagem:", err.message);
    res.status(500).json({ erro: "Erro ao excluir mensagem." });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));