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
  const svgVer = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const svgOcultar = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = svgOcultar;
    btn.setAttribute('aria-label', 'Ocultar senha');
  } else {
    input.type = 'password';
    btn.innerHTML = svgVer;
    btn.setAttribute('aria-label', 'Mostrar senha');
  }
}
