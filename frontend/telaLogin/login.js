// Este é o conteúdo que deve estar no seu arquivo: login.js

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const errorMessage = document.getElementById("error-message");

  // Verifica se todos os elementos foram encontrados
  if (!loginForm || !emailInput || !senhaInput || !errorMessage) {
      console.error("Erro: Um ou mais elementos do formulário de login não foram encontrados no HTML.");
      alert("Erro ao carregar a página de login. Tente recarregar.");
      return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const senha = senhaInput.value; 

    try {
      // --- PONTO CRÍTICO ---
      // Verifica se a URL está correta (porta 3001)
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      console.log("Resposta recebida do servidor:", data);

      if (!response.ok) {
        // Mostra o erro vindo do servidor (ex: "Email ou senha inválidos.")
        errorMessage.textContent = data.erro || `Erro ${response.status}. Tente novamente.`;
      } else {
        // SUCESSO!
        // Salva os dados do usuário no localStorage
        // Você usou 'usuarioLogado' no cadastro, vamos manter o padrão.
        localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
        
        // Redireciona para a tela inicial
        window.location.href = "../telaInicial/telaInicial.html"; 
      }

    } catch (err) {
      console.error("Erro na requisição de login:", err);
      errorMessage.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});