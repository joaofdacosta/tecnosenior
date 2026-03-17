// ===========================================
// ARQUIVO: esqueciSenha.js (CORRIGIDO)
// ===========================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos da ETAPA 1 (Solicitar Código) ---
  const formRequest = document.getElementById("form-request");
  const emailInput = document.getElementById("request-email");
  const usernameInput = document.getElementById("request-username");
  const requestMessage = document.getElementById("request-message");

  // --- Elementos da ETAPA 2 (Resetar Senha) ---
  const formReset = document.getElementById("form-reset");
  const codeInput = document.getElementById("reset-code");
  const senhaInput = document.getElementById("reset-senha");
  const confirmarSenhaInput = document.getElementById("reset-confirmar-senha");
  const resetMessage = document.getElementById("reset-message");

  // --- LÓGICA DA ETAPA 1 (Solicitar Código) ---
  formRequest.addEventListener("submit", async (e) => {
    e.preventDefault();
    requestMessage.textContent = "A processar...";
    requestMessage.style.color = "black";

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();

    try {
      // Chama a Rota 1 (porta 3001)
      const response = await fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        requestMessage.style.color = "red";
        requestMessage.textContent = data.erro || "Erro no servidor.";
      } else {
        requestMessage.style.color = "green";
        requestMessage.textContent = "Código gerado!";
        alert("Verifique o terminal do servidor para ver o seu código de redefinição.");

        // Esconde o formulário 1 e mostra o formulário 2
        formRequest.style.display = "none";
        formReset.style.display = "block";
      }
    } catch (err) {
      console.error("Erro na requisição da Etapa 1:", err);
      requestMessage.style.color = "red";
      requestMessage.textContent = "Não foi possível conectar ao servidor.";
    }
  });

  // --- LÓGICA DA ETAPA 2 (Cadastrar nova senha) ---
  formReset.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetMessage.textContent = "";

    const token = codeInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (senha !== confirmarSenha) {
      resetMessage.textContent = "As senhas não coincidem.";
      return;
    }

    if (senha.length < 6) {
      resetMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
      return;
    }

    try {
      // Chama a Rota 2 (porta 3001)
      const response = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        resetMessage.textContent = data.erro || "Erro ao redefinir a senha.";
      } else {
        alert(data.mensagem); // "Senha redefinida com sucesso!"
        window.location.href = "../telaLogin/telaLogin.html";
      }
    } catch (err) {
      console.error("Erro na requisição da Etapa 2:", err);
      resetMessage.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});
