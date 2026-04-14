function alterarFonte(acao) {
  let tamanhoAtual = parseInt(localStorage.getItem("tamanhoFonte")) || 16;

  if (acao === "aumentar") {
    tamanhoAtual += 2;
    if (tamanhoAtual > 26) tamanhoAtual = 26;
  } else if (acao === "diminuir") {
    tamanhoAtual -= 2;
    if (tamanhoAtual < 14) tamanhoAtual = 14;
  }

  document.documentElement.style.setProperty(
    "--tamanho-fonte",
    tamanhoAtual + "px",
  );

  localStorage.setItem("tamanhoFonte", tamanhoAtual);
}

function alternarContraste() {
  const body = document.body;
  body.classList.toggle("alto-contraste");
  const isAltoContraste = body.classList.contains("alto-contraste");
  localStorage.setItem("altoContraste", isAltoContraste);
}

function alternarDestaqueLeitura() {
  const body = document.body;
  body.classList.toggle("destaque-leitura");

  const isAtivo = body.classList.contains("destaque-leitura");
  localStorage.setItem("destaqueLeitura", isAtivo);

  const btn = document.getElementById("btn-destaque-leitura");
  if (btn) {
    btn.classList.toggle("destaque-ativo", isAtivo);
    btn.setAttribute("aria-pressed", isAtivo);
  }
}

function carregarPreferencias() {
  const tamanhoSalvo = localStorage.getItem("tamanhoFonte");
  if (tamanhoSalvo) {
    document.documentElement.style.setProperty(
      "--tamanho-fonte",
      tamanhoSalvo + "px",
    );
  } else {
    document.documentElement.style.setProperty("--tamanho-fonte", "16px");
  }

  const contrasteSalvo = localStorage.getItem("altoContraste");
  if (contrasteSalvo === "true") {
    document.body.classList.add("alto-contraste");
  }

  const destaqueSalvo = localStorage.getItem("destaqueLeitura");
  if (destaqueSalvo === "true") {
    document.body.classList.add("destaque-leitura");
    const btn = document.getElementById("btn-destaque-leitura");
    if (btn) {
      btn.classList.add("destaque-ativo");
      btn.setAttribute("aria-pressed", "true");
    }
  }
}

document.addEventListener("DOMContentLoaded", carregarPreferencias);
