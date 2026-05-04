-- =========================================
-- BANCO DE DADOS TECNOSENIOR
-- =========================================

-- ==============================
-- TABELA USUÁRIOS
-- ==============================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    genero VARCHAR(50),
    cpf VARCHAR(20),
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP
);

-- ==============================
-- TABELA VÍDEOS
-- ==============================
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    url_do_video_local TEXT,
    imagem_capa TEXT,
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garante a coluna imagem_capa em bancos antigos
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS imagem_capa TEXT;

-- ==============================
-- TABELA INTERAÇÕES
-- ==============================
CREATE TABLE IF NOT EXISTS video_interacoes (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    curtido BOOLEAN DEFAULT FALSE,
    favoritado BOOLEAN DEFAULT FALSE,

    CONSTRAINT unique_interacao UNIQUE (video_id, usuario_id),

    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==============================
-- TABELA COMENTÁRIOS
-- ==============================
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==============================
-- TABELA MENSAGENS DE CONTATO
-- ==============================
CREATE TABLE IF NOT EXISTS mensagens_contato (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE
);

-- ==============================
-- INSERÇÃO INICIAL DOS VÍDEOS
-- ==============================
INSERT INTO videos (id, titulo, descricao, categoria, url_do_video_local, imagem_capa)
VALUES
(1, 'Aula 1', 'Introdução ao curso', 'Básico', '/telaPagVideo/videos/aula1.mp4', '/telaInicial/ImgCursoAltSenha.png'),
(2, 'Aula 2', 'Segunda aula', 'Básico', '/telaPagVideo/videos/aula2.mp4', '/telaInicial/ImgCursoEmail.png'),
(3, 'Aula 3', 'Terceira aula', 'Básico', '/telaPagVideo/videos/aula3.mp4', '/telaInicial/ImgCursoGoogle.png'),
(4, 'Aula 4', 'Quarta aula', 'Básico', '/telaPagVideo/videos/aula4.mp4', '/telaInicial/ImgCursoWinDef.png')
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- ATUALIZAÇÃO DOS CAMINHOS
-- PARA BANCOS JÁ EXISTENTES
-- ==============================
UPDATE videos
SET
    url_do_video_local = '/telaPagVideo/videos/aula1.mp4',
    imagem_capa = '/telaInicial/ImgCursoAltSenha.png'
WHERE id = 1;

UPDATE videos
SET
    url_do_video_local = '/telaPagVideo/videos/aula2.mp4',
    imagem_capa = '/telaInicial/ImgCursoEmail.png'
WHERE id = 2;

UPDATE videos
SET
    url_do_video_local = '/telaPagVideo/videos/aula3.mp4',
    imagem_capa = '/telaInicial/ImgCursoGoogle.png'
WHERE id = 3;

UPDATE videos
SET
    url_do_video_local = '/telaPagVideo/videos/aula4.mp4',
    imagem_capa = '/telaInicial/ImgCursoWinDef.png'
WHERE id = 4;