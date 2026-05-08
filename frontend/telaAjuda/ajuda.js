// ---- ACORDEÃO FAQ ----
document.querySelectorAll(".faq-pergunta").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    const targetId = btn.getAttribute("aria-controls");
    const resposta = document.getElementById(targetId);

    // Fecha todos os outros
    document.querySelectorAll(".faq-pergunta").forEach((other) => {
      if (other !== btn) {
        other.setAttribute("aria-expanded", "false");
        const otherId = other.getAttribute("aria-controls");
        document.getElementById(otherId)?.classList.remove("aberta");
      }
    });

    btn.setAttribute("aria-expanded", !isExpanded);
    resposta.classList.toggle("aberta", !isExpanded);
  });
});

// ---- PRÉ-PREENCHER COM DADOS DO USUÁRIO LOGADO ----
const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
if (usuario) {
  const nomeInput = document.getElementById("contato-nome");
  const emailInput = document.getElementById("contato-email");
  if (nomeInput && usuario.username) nomeInput.value = usuario.username;
  if (emailInput && usuario.email) emailInput.value = usuario.email;
}

// ---- FORMULÁRIO DE CONTATO ----
const form = document.getElementById("form-contato");
const statusEl = document.getElementById("mensagem-status");
const btnEnviar = document.getElementById("btn-enviar");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("contato-nome").value.trim();
  const email = document.getElementById("contato-email").value.trim();
  const tipo = document.getElementById("contato-tipo").value;
  const mensagem = document.getElementById("contato-mensagem").value.trim();

  if (!nome || !email || !tipo || !mensagem) {
    statusEl.style.color = "red";
    statusEl.textContent = "Por favor, preencha todos os campos antes de enviar.";
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";
  statusEl.textContent = "";

  try {
    const res = await fetch("http://localhost:3001/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, tipo, mensagem }),
    });

    const data = await res.json();

    if (res.ok) {
      statusEl.style.color = "#24483e";
      statusEl.textContent = "✅ Mensagem enviada com sucesso! Responderemos em breve.";
      form.reset();
      if (usuario) {
        if (document.getElementById("contato-nome")) document.getElementById("contato-nome").value = usuario.username || "";
        if (document.getElementById("contato-email")) document.getElementById("contato-email").value = usuario.email || "";
      }
    } else {
      statusEl.style.color = "red";
      statusEl.textContent = data.erro || "Erro ao enviar. Tente novamente.";
    }
  } catch {
    statusEl.style.color = "red";
    statusEl.textContent = "Não foi possível conectar ao servidor. Verifique sua conexão.";
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar Mensagem";
  }
});
