document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastro-form");
  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const senhaInput = document.getElementById("senha");
  const confirmarSenhaInput = document.getElementById("confirmar-senha");
  const errorMessage = document.getElementById("error-message");

  // Verifica se elementos existem
  if (!cadastroForm || !emailInput || !usernameInput || !senhaInput || !confirmarSenhaInput || !errorMessage) {
    console.error("Erro: Elementos do formulário de cadastro não encontrados!");
    alert("Erro ao carregar a página de cadastro.");
    return;
  }

  cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const senha = senhaInput.value; // Não faz trim em senhas
    const confirmarSenha = confirmarSenhaInput.value;

    if (!email || !username || !senha || !confirmarSenha) {
        errorMessage.textContent = "Por favor, preencha todos os campos.";
        return;
    }

    if (senha !== confirmarSenha) {
      errorMessage.textContent = "As senhas não coincidem.";
      return;
    }

    if (senha.length < 6) {
      errorMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, senha }),
      });

      // Tenta ler a resposta como JSON, mesmo que seja erro
      const data = await response.json();

      if (!response.ok) {
        // Se a resposta NÃO for OK (2xx), mostra o erro do servidor
        errorMessage.textContent = data.erro || `Erro ${response.status}: ${response.statusText}`;
      } else {
        // Se a resposta FOR OK (201 Created)
        alert("Usuário criado com sucesso! Você será redirecionado para o login.");
        // Caminho CORRIGIDO para o redirecionamento
        window.location.href = "../telaLogin/telaLogin.html";
      }
    } catch (err) {
      // Erro de rede ou erro ao tentar parsear o JSON (ex: servidor enviou HTML 404)
      console.error("Erro na requisição de cadastro:", err);
      // Verifica se o erro foi de JSON inválido vindo de um 404
      if (err instanceof SyntaxError && err.message.includes("Unexpected token '<'")) {
           errorMessage.textContent = "Erro interno no servidor (rota não encontrada?). Verifique o console do back-end.";
      } else {
           errorMessage.textContent = "Não foi possível conectar ao servidor. Verifique se ele está rodando.";
      }
    }
  });
});

function toggleSenha(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Ocultar senha');
  } else {
    input.type = 'password';
    btn.textContent = '👁';
    btn.setAttribute('aria-label', 'Mostrar senha');
  }
}
