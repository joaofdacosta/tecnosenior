document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const errorMessage = document.getElementById("error-message");

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
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMessage.textContent = data.erro || `Erro ${response.status}. Tente novamente.`;
      } else {
        localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
        sessionStorage.setItem('ts_recem_logado', '1');
        window.location.href = "../telaInicial/telaInicial.html";
      }

    } catch (err) {
      console.error("Erro na requisição de login:", err);
      errorMessage.textContent = "Não foi possível conectar ao servidor.";
    }
  });
});
