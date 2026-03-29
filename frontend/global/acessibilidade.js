// ==========================================
// ARQUIVO: global/acessibilidade.js
// ==========================================

// 1. Função para alterar o tamanho da fonte
function alterarFonte(acao) {
  // Pega o tamanho atual salvo no navegador ou usa 16 como padrão
  let tamanhoAtual = parseInt(localStorage.getItem("tamanhoFonte")) || 16;

  if (acao === "aumentar") {
    tamanhoAtual += 2; // Aumenta de 2 em 2
    if (tamanhoAtual > 26) tamanhoAtual = 26; // Limite máximo para não quebrar a tela
  } else if (acao === "diminuir") {
    tamanhoAtual -= 2; // Diminui de 2 em 2
    if (tamanhoAtual < 14) tamanhoAtual = 14; // Limite mínimo para leitura
  }

  // Aplica o novo tamanho na raiz do site
  document.documentElement.style.setProperty(
    "--tamanho-fonte",
    tamanhoAtual + "px",
  );

  // Salva a escolha do usuário no navegador (localStorage)
  localStorage.setItem("tamanhoFonte", tamanhoAtual);
}

// 2. Função para ativar/desativar o Alto Contraste
function alternarContraste() {
  const body = document.body;

  // Liga ou desliga a classe 'alto-contraste' no <body>
  body.classList.toggle("alto-contraste");

  // Verifica se a classe ficou ativada ou desativada
  const isAltoContraste = body.classList.contains("alto-contraste");

  // Salva a escolha no navegador
  localStorage.setItem("altoContraste", isAltoContraste);
}

// 3. Função que roda SOZINHA toda vez que uma tela é aberta
function carregarPreferencias() {
  // Carrega a fonte salva
  const tamanhoSalvo = localStorage.getItem("tamanhoFonte");
  if (tamanhoSalvo) {
    document.documentElement.style.setProperty(
      "--tamanho-fonte",
      tamanhoSalvo + "px",
    );
  } else {
    document.documentElement.style.setProperty("--tamanho-fonte", "16px");
  }

  // Carrega o contraste salvo
  const contrasteSalvo = localStorage.getItem("altoContraste");
  if (contrasteSalvo === "true") {
    document.body.classList.add("alto-contraste");
  }
}

// Avisa o navegador para rodar a função acima assim que carregar o HTML
document.addEventListener("DOMContentLoaded", carregarPreferencias);
