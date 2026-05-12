const API = "http://localhost:3001";

let mensagemAtual = null;

function formatarData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function carregarMensagens() {
  const tipo = document.getElementById("filtro-tipo").value;
  const lida = document.getElementById("filtro-lida").value;
  const lista = document.getElementById("lista-mensagens");
  lista.innerHTML = '<p class="carregando">Carregando...</p>';

  const params = new URLSearchParams();
  if (tipo) params.append("tipo", tipo);
  if (lida !== "") params.append("lida", lida);

  try {
    const res = await fetch(`${API}/admin/mensagens?${params}`);
    const mensagens = await res.json();

    atualizarStats(mensagens);

    if (mensagens.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhuma mensagem encontrada.</p>';
      return;
    }

    lista.innerHTML = mensagens.map((m) => `
      <div class="msg-card ${m.lida ? "" : "nao-lida"}" onclick="abrirModal(${m.id})" data-id="${m.id}">
        <div class="msg-indicador"></div>
        <div class="msg-corpo">
          <div class="msg-cabecalho">
            <span class="msg-nome">${escapeHtml(m.nome)}</span>
            <span class="msg-badge">${escapeHtml(m.tipo)}</span>
            ${m.respondida ? '<span class="msg-badge" style="background:#d4edda;color:#1a7a3c">✔ Respondida</span>' : ""}
            <span class="msg-data">${formatarData(m.data_envio)}</span>
          </div>
          <p class="msg-preview">${escapeHtml(m.mensagem)}</p>
        </div>
      </div>
    `).join("");
  } catch {
    lista.innerHTML = '<p class="carregando" style="color:red">Erro ao carregar mensagens. Verifique se o servidor está rodando.</p>';
  }
}

function atualizarStats(mensagens) {
  const total = mensagens.length;
  const naoLidas = mensagens.filter((m) => !m.lida).length;
  document.getElementById("total-count").textContent = total;
  document.getElementById("nao-lidas-count").textContent = naoLidas;
  document.getElementById("lidas-count").textContent = total - naoLidas;
}

async function abrirModal(id) {
  try {
    const res = await fetch(`${API}/admin/mensagens`);
    const mensagens = await res.json();
    const m = mensagens.find((x) => x.id === id);
    if (!m) return;

    mensagemAtual = m;

    document.getElementById("modal-tipo").textContent = m.tipo;
    document.getElementById("modal-titulo").textContent = m.nome;
    document.getElementById("modal-email").textContent = "✉️ " + m.email;
    document.getElementById("modal-data").textContent = "🕐 " + formatarData(m.data_envio);
    document.getElementById("modal-mensagem").textContent = m.mensagem;
    atualizarBotaoLida(m.lida);

    // Exibe resposta anterior ou seção de responder
    const respostaEnviada = document.getElementById("resposta-enviada");
    const secaoResponder = document.getElementById("secao-responder");
    document.getElementById("campo-resposta").value = "";
    document.getElementById("resposta-status").textContent = "";

    if (m.respondida && m.resposta) {
      respostaEnviada.classList.remove("hidden");
      document.getElementById("modal-data-resposta").textContent = formatarData(m.data_resposta);
      document.getElementById("modal-resposta-texto").textContent = m.resposta;
      secaoResponder.style.display = "none";
    } else {
      respostaEnviada.classList.add("hidden");
      secaoResponder.style.display = "";
    }

    document.getElementById("modal-overlay").classList.remove("hidden");

    if (!m.lida) {
      await fetch(`${API}/admin/mensagens/${id}/lida`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lida: true }),
      });
      mensagemAtual.lida = true;
      atualizarBotaoLida(true);
      const card = document.querySelector(`.msg-card[data-id="${id}"]`);
      if (card) {
        card.classList.remove("nao-lida");
        card.querySelector(".msg-indicador").style.background = "#ccc";
      }
      const naoLidasEl = document.getElementById("nao-lidas-count");
      const lidasEl = document.getElementById("lidas-count");
      naoLidasEl.textContent = Math.max(0, parseInt(naoLidasEl.textContent) - 1);
      lidasEl.textContent = parseInt(lidasEl.textContent) + 1;
    }
  } catch {
    alert("Erro ao abrir a mensagem.");
  }
}

function atualizarBotaoLida(lida) {
  const btn = document.getElementById("btn-toggle-lida");
  btn.textContent = lida ? "Marcar como não lida" : "Marcar como lida";
}

async function toggleLida() {
  if (!mensagemAtual) return;
  const novoEstado = !mensagemAtual.lida;
  try {
    await fetch(`${API}/admin/mensagens/${mensagemAtual.id}/lida`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lida: novoEstado }),
    });
    mensagemAtual.lida = novoEstado;
    atualizarBotaoLida(novoEstado);
    fecharModal();
    carregarMensagens();
  } catch {
    alert("Erro ao atualizar status da mensagem.");
  }
}

async function enviarResposta() {
  if (!mensagemAtual) return;
  const resposta = document.getElementById("campo-resposta").value.trim();
  const statusEl = document.getElementById("resposta-status");
  const btn = document.getElementById("btn-enviar-resposta");

  if (!resposta) {
    statusEl.style.color = "red";
    statusEl.textContent = "Escreva uma resposta antes de enviar.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enviando...";
  statusEl.textContent = "";

  try {
    const res = await fetch(`${API}/admin/mensagens/${mensagemAtual.id}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resposta }),
    });
    const data = await res.json();

    if (res.ok) {
      statusEl.style.color = "#1a7a3c";
      statusEl.textContent = "✅ Resposta enviada com sucesso!";
      mensagemAtual.respondida = true;
      mensagemAtual.resposta = resposta;
      mensagemAtual.data_resposta = new Date().toISOString();

      setTimeout(() => {
        document.getElementById("resposta-enviada").classList.remove("hidden");
        document.getElementById("modal-data-resposta").textContent = formatarData(mensagemAtual.data_resposta);
        document.getElementById("modal-resposta-texto").textContent = resposta;
        document.getElementById("secao-responder").style.display = "none";
        carregarMensagens();
      }, 1000);
    } else {
      statusEl.style.color = "red";
      statusEl.textContent = data.erro || "Erro ao enviar resposta.";
      btn.disabled = false;
      btn.textContent = "Enviar Resposta";
    }
  } catch {
    statusEl.style.color = "red";
    statusEl.textContent = "Não foi possível conectar ao servidor.";
    btn.disabled = false;
    btn.textContent = "Enviar Resposta";
  }
}

async function excluirMensagem() {
  if (!mensagemAtual) return;
  if (!confirm(`Excluir a mensagem de "${mensagemAtual.nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await fetch(`${API}/admin/mensagens/${mensagemAtual.id}`, { method: "DELETE" });
    fecharModal();
    carregarMensagens();
  } catch {
    alert("Erro ao excluir a mensagem.");
  }
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  mensagemAtual = null;
}

document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModal();
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

carregarMensagens();
