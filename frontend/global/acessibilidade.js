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

let _vozAltaHandler = null;

function alternarVozAlta() {
  const body = document.body;
  body.classList.toggle("voz-alta");
  const isAtivo = body.classList.contains("voz-alta");
  localStorage.setItem("vozAlta", isAtivo);

  const btn = document.getElementById("btn-voz-alta");
  if (btn) {
    btn.classList.toggle("voz-ativo", isAtivo);
    btn.setAttribute("aria-pressed", isAtivo);
  }

  if (isAtivo) {
    _ativarVozAlta();
  } else {
    _desativarVozAlta();
  }
}

function _ativarVozAlta() {
  const seletores = "p, h1, h2, h3, h4, li, label, span.view-text, .meta, .lede, .categoria-titulo";
  _vozAltaHandler = (e) => {
    const el = e.target.closest(seletores);
    if (!el) return;
    const texto = el.innerText?.trim();
    if (!texto) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.9;
    window.speechSynthesis.speak(fala);
  };
  document.addEventListener("mouseover", _vozAltaHandler);
}

function _desativarVozAlta() {
  window.speechSynthesis.cancel();
  if (_vozAltaHandler) {
    document.removeEventListener("mouseover", _vozAltaHandler);
    _vozAltaHandler = null;
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

  const vozAltaSalvo = localStorage.getItem("vozAlta");
  if (vozAltaSalvo === "true") {
    document.body.classList.add("voz-alta");
    const btn = document.getElementById("btn-voz-alta");
    if (btn) {
      btn.classList.add("voz-ativo");
      btn.setAttribute("aria-pressed", "true");
    }
    _ativarVozAlta();
  }
}

document.addEventListener("DOMContentLoaded", carregarPreferencias);
