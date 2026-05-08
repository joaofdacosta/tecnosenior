// ===========================================
// ARQUIVO: perfil.js (FINAL BLINDADO)
// ===========================================

const API_BASE_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", async () => {
    // Elementos de Visualização
    const viewUsername = document.getElementById("view-username");
    const viewEmail = document.getElementById("view-email");
    const viewCpf = document.getElementById("view-cpf");
    const viewNascimento = document.getElementById("view-nascimento");
    const viewGenero = document.getElementById("view-genero");
    const headerNome = document.getElementById("header-nome");

    // Elementos de Edição
    const inputUsername = document.getElementById("input-username");
    const inputEmail = document.getElementById("input-email");
    const inputCpf = document.getElementById("input-cpf");
    const inputNascimento = document.getElementById("input-nascimento");
    const inputGenero = document.getElementById("input-genero");
    const inputSenha = document.getElementById("input-senha");
    const containerSenha = document.getElementById("container-senha");
    
    // Botões
    const btnToggleEdit = document.getElementById("btn-toggle-edit");
    const btnSalvar = document.getElementById("btn-salvar");
    const formPerfil = document.getElementById("form-perfil");
    const msgStatus = document.getElementById("mensagem-status");
    const btnLogout = document.getElementById("logout-button");

    let isEditMode = false;

    // Máscara de CPF
    if (inputCpf) {
        inputCpf.addEventListener('input', () => {
            let v = inputCpf.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
            else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
            else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
            inputCpf.value = v;
        });
    }

    // 1. VERIFICAÇÃO INICIAL
    const usuarioString = localStorage.getItem('usuarioLogado');
    if (!usuarioString) {
        alert("Sessão expirada.");
        window.location.href = "../telaLogin/telaLogin.html";
        return;
    }
    
    let usuarioLocal;
    try {
        usuarioLocal = JSON.parse(usuarioString);
    } catch (e) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = "../telaLogin/telaLogin.html";
        return;
    }
    const userId = usuarioLocal.id;

    // 2. FUNÇÃO PARA CARREGAR DADOS
    async function carregarDados() {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados.");
            
            const dados = await response.json();

            // Atualiza Cabeçalho
            if (headerNome) headerNome.textContent = dados.username;

            // Atualiza Visualização
            viewUsername.textContent = dados.username;
            viewEmail.textContent = dados.email;
            viewCpf.textContent = dados.cpf || "Não informado";
            viewGenero.textContent = dados.genero || "Não informado";
            
            if (dados.data_nascimento) {
                const dataObj = new Date(dados.data_nascimento);
                viewNascimento.textContent = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                inputNascimento.value = dados.data_nascimento.split('T')[0];
            } else {
                viewNascimento.textContent = "Não informada";
                inputNascimento.value = "";
            }

            // Preenche Inputs
            inputUsername.value = dados.username;
            inputEmail.value = dados.email;
            inputCpf.value = dados.cpf || "";
            inputGenero.value = dados.genero || "";

        } catch (err) {
            console.error(err);
            msgStatus.textContent = "Erro ao carregar dados.";
            msgStatus.style.color = "red";
        }
    }

    await carregarDados();

    // 3. BOTÃO LÁPIS (Alternar)
    if (btnToggleEdit) {
        btnToggleEdit.addEventListener("click", (e) => {
            e.preventDefault();
            isEditMode = !isEditMode;

            const viewElements = document.querySelectorAll(".view-text");
            const editElements = document.querySelectorAll(".edit-input");

            if (isEditMode) {
                viewElements.forEach(el => el.style.display = "none");
                editElements.forEach(el => el.style.display = "block");
                if (btnSalvar) btnSalvar.style.display = "block";
                if (containerSenha) containerSenha.style.display = "block";
                msgStatus.textContent = "Editando...";
                msgStatus.style.color = "#24483e";
            } else {
                viewElements.forEach(el => el.style.display = "block");
                editElements.forEach(el => el.style.display = "none");
                if (btnSalvar) btnSalvar.style.display = "none";
                if (containerSenha) containerSenha.style.display = "none";
                msgStatus.textContent = "";
                carregarDados(); // Reseta alterações não salvas
            }
        });
    }

    // 4. SALVAR (PUT)
    if (formPerfil) {
        formPerfil.addEventListener("submit", async (e) => {
            e.preventDefault();
            msgStatus.textContent = "Salvando...";
            
            // PREPARAÇÃO DOS DADOS (Proteção Extra no Frontend)
            const payload = {
                username: inputUsername.value,
                email: inputEmail.value,
                cpf: inputCpf.value === "" ? null : inputCpf.value,
                data_nascimento: inputNascimento.value === "" ? null : inputNascimento.value,
                genero: inputGenero.value === "" ? null : inputGenero.value,
                senha: inputSenha.value 
            };

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    msgStatus.textContent = result.erro || "Erro ao salvar.";
                    msgStatus.style.color = "red";
                    console.error("Erro backend:", result);
                } else {
                    msgStatus.textContent = "Salvo com sucesso!";
                    msgStatus.style.color = "green";
                    
                    // Atualiza nome localmente
                    usuarioLocal.username = payload.username;
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLocal));
                    
                    inputSenha.value = "";
                    await carregarDados();
                    
                    if(btnToggleEdit) btnToggleEdit.click(); // Sai do modo edição
                }
            } catch (err) {
                console.error(err);
                msgStatus.textContent = "Erro de conexão.";
                msgStatus.style.color = "red";
            }
        });
    }

    // 5. LOGOUT
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem('usuarioLogado');
            window.location.href = "../telaLogin/telaLogin.html";
        });
    }
});