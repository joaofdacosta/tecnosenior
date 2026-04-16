# TecnoSenior

Plataforma de vídeo-aulas voltada para a terceira idade, com foco em acessibilidade e facilidade de uso. O projeto foi desenvolvido como trabalho acadêmico do 5º período.

## Sobre o projeto

O TecnoSenior ensina tecnologia do dia a dia para pessoas idosas por meio de vídeo-aulas curtas e organizadas por categoria. A plataforma conta com recursos de acessibilidade como ajuste de tamanho de fonte, modo alto contraste e destaque de leitura.

## Funcionalidades

- Cadastro e login de usuários
- Catálogo de vídeo-aulas por categoria
- Player de vídeo com controle de velocidade
- Curtir e favoritar vídeos
- Comentários por aula
- Perfil do usuário (edição de dados)
- Recuperação de senha por token
- Barra de acessibilidade em todas as telas (fonte, alto contraste, destaque de leitura)

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express.js |
| Banco de dados | PostgreSQL |
| Frontend | HTML5 + CSS3 + JavaScript puro |

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando

### 1. Banco de dados

No pgAdmin (ou psql), crie um banco chamado `TecnoSenior` e execute o arquivo `database.sql`:

```sql
-- Abra o Query Tool no banco TecnoSenior e cole o conteúdo de database.sql
```

### 2. Configurar credenciais

Edite o arquivo `backend/.env` com a sua senha do PostgreSQL:

```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=TecnoSenior
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432
```

### 3. Instalar dependências e iniciar

```bash
cd backend
npm install
npm start
```

Acesse em: [http://localhost:3001](http://localhost:3001)

## Estrutura do projeto

```
tecnosenior/
├── backend/
│   ├── server.js        # Servidor Express + todas as rotas da API
│   ├── .env             # Credenciais do banco (não versionar)
│   └── package.json
├── frontend/
│   ├── global/          # Acessibilidade (CSS + JS compartilhados)
│   ├── telaInicial/     # Página inicial com catálogo de cursos
│   ├── telaLogin/       # Login
│   ├── telaCadastroUsuario/   # Cadastro
│   ├── telaEsqueciMinhaSenha/ # Recuperação de senha
│   ├── telaPagVideo/    # Player de vídeo
│   └── telaPerfil/      # Perfil do usuário
└── database.sql         # Script completo do banco de dados
```

## Contribuidores

Projeto desenvolvido por estudantes do curso de Análise e Desenvolvimento de Sistemas.
