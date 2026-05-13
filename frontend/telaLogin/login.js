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
