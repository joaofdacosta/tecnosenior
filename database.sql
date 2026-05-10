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
(1, 'Criando um Email', 'Passo a passo simples para criar seu primeiro email', 'Email', '/telaPagVideo/videos/aula1.mp4', '/telaInicial/ImgCursoAltSenha.png'),
(2, 'Alterando idioma e como enviar/encaminhar um email', 'Passo a passo simples para alterar o idioma e enviar/encaminhar email', 'Email', '/telaPagVideo/videos/aula2.mp4', '/telaInicial/ImgCursoEmail.png'),
(3, 'Utilizando a pesquisa google e abrindo novas abas', 'Passo a passo simples para começar uma pesquisa no Google, e abrir novas abas', 'Navegação', '/telaPagVideo/videos/aula3.mp4', '/telaInicial/ImgCursoGoogle.png'),
(4, 'Segurança do windows', 'Passo a passo simples para ativar e usar o Windows Defender', 'Segurança', '/telaPagVideo/videos/aula4.mp4', '/telaInicial/ImgCursoWinDef.png')
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- ATUALIZAÇÃO DOS DADOS
-- PARA BANCOS JÁ EXISTENTES
-- ==============================
UPDATE videos SET
    titulo = 'Criando um Email',
    descricao = 'Passo a passo simples para criar seu primeiro email',
    categoria = 'Email',
    url_do_video_local = '/telaPagVideo/videos/aula1.mp4',
    imagem_capa = '/telaInicial/ImgCursoAltSenha.png'
WHERE id = 1;

UPDATE videos SET
    titulo = 'Alterando idioma e como enviar/encaminhar um email',
    descricao = 'Passo a passo simples para alterar o idioma e enviar/encaminhar email',
    categoria = 'Email',
    url_do_video_local = '/telaPagVideo/videos/aula2.mp4',
    imagem_capa = '/telaInicial/ImgCursoEmail.png'
WHERE id = 2;

UPDATE videos SET
    titulo = 'Utilizando a pesquisa google e abrindo novas abas',
    descricao = 'Passo a passo simples para começar uma pesquisa no Google, e abrir novas abas',
    categoria = 'Navegação',
    url_do_video_local = '/telaPagVideo/videos/aula3.mp4',
    imagem_capa = '/telaInicial/ImgCursoGoogle.png'
WHERE id = 3;

UPDATE videos SET
    titulo = 'Segurança do windows',
    descricao = 'Passo a passo simples para ativar e usar o Windows Defender',
    categoria = 'Segurança',
    url_do_video_local = '/telaPagVideo/videos/aula4.mp4',
    imagem_capa = '/telaInicial/ImgCursoWinDef.png'
WHERE id = 4;