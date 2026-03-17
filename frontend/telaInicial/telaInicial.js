// ===========================================
// ARQUIVO: script.js (ADAPTAÇÃO FINAL PARA HTML INTOCADO)
// ===========================================

// Constante para a porta do seu Backend
const API_BASE_URL = "http://localhost:3001";

// -------------------------------------------
// 1. LÓGICA DE LOGIN/LOGOUT (Controle do Cabeçalho APENAS por JS)
// -------------------------------------------
function checkLoginStatus() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const navActions = document.querySelector('.nav-actions');

    if (!navActions) return; 

    // OBTENÇÃO DOS LINKS PELA ORDEM DENTRO DO .nav-actions
    // [0] = Login, [1] = Perfil, [2] = Sobre Nós
    const allLinks = navActions.querySelectorAll('a');
    
    const linkLogin = allLinks[0];
    const linkPerfil = allLinks[1];
    
    // Tentativa de buscar o botão Sair, caso já o tenhamos criado dinamicamente antes
    let btnLogout = document.getElementById('btn-logout-js'); 
    
    if (usuarioLogado) {
        // --- LOGADO ---
        if (linkLogin) linkLogin.style.display = 'none'; // Esconde Login
        
        if (linkPerfil) {
            linkPerfil.style.display = 'block'; // Garante que Perfil esteja visível
            linkPerfil.href = "../telaPerfil/telaPerfil.html"; // Redireciona para a página real
            
            try {
                // Personaliza o texto do link Perfil
                const user = JSON.parse(usuarioLogado);
                linkPerfil.textContent = `Olá, ${user.username.split(' ')[0]}`;
            } catch (e) {
                linkPerfil.textContent = "Perfil";
            }
        }

        // Adiciona o botão Sair dinamicamente
        if (!btnLogout) {
            btnLogout = document.createElement('a');
            btnLogout.id = 'btn-logout-js';
            btnLogout.className = 'btn btn-ghost'; // Usa a classe do seu CSS
            btnLogout.textContent = 'Sair';
            btnLogout.href = '#';
            
            // Insere o Sair após o Perfil, antes do Sobre Nós (link [2])
            if (linkPerfil && allLinks[2]) {
                navActions.insertBefore(btnLogout, allLinks[2]); 
            } else if (linkPerfil) {
                navActions.appendChild(btnLogout); 
            }
            
            // Lógica de Logout
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('usuarioLogado');
                window.location.reload(); 
            });
        }
        
    } else {
        // --- NÃO LOGADO ---
        if (linkLogin) linkLogin.style.display = 'block'; // Mostra Login
        if (linkPerfil) {
            linkPerfil.style.display = 'none'; // Esconde Perfil
        }
        // Remove o botão Sair dinâmico, se existir
        if (btnLogout) {
             btnLogout.remove();
        }
    }
}


// -------------------------------------------
// 2. LÓGICA DE CARREGAMENTO DOS VÍDEOS
// -------------------------------------------
async function loadVideos() {
    // ENCONTRAR O CONTAINER DE VÍDEOS: 
    // Busca a seção #cursos (que deve ter o id="cursos")
    const sectionCursos = document.getElementById("cursos");
    let container = null;
    
    if (sectionCursos) {
        // Encontra o primeiro <div> com a classe 'cards' dentro da seção #cursos
        container = sectionCursos.querySelector('.cards'); 
    }

    if (!container) {
        console.error("Erro: Container de vídeos não encontrado. Verifique se a seção 'cursos' existe e contém o div.cards.");
        return;
    }

    // O JS vai APAGAR os cards fixos que estiverem aqui dentro e colocar os dinâmicos
    container.innerHTML = "<p>Carregando vídeos...</p>"; 

    try {
        const response = await fetch(`${API_BASE_URL}/videos`);

        if (!response.ok) {
            let errorMsg = `Erro ${response.status} ao buscar vídeos.`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.erro || errorMsg;
            } catch (jsonError) {
                errorMsg = response.statusText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        const videos = await response.json();
        container.innerHTML = ""; // Limpa o "Carregando..."

        if (!videos || videos.length === 0) {
            container.innerHTML = "<p>Nenhum vídeo disponível no momento.</p>";
            return;
        }

        // Itera sobre cada vídeo e cria o card
        for (const video of videos) {
            const card = document.createElement("article");
            card.className = "card";
            card.setAttribute("role", "listitem");

            const linkParaVideo = `../telaPagVideo/telaPagVideo.html?id=${video.id}`;

            card.innerHTML = `
            <a href="${linkParaVideo}" class="card-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <img src="${video.url_thumbnail_lista || 'placeholder.png'}" alt="Thumbnail do vídeo ${video.titulo || 'Sem título'}" onerror="this.onerror=null; this.src='https://placehold.co/300x180/EFEFEF/AAAAAA?text=Imagem+Indisponível';">
                <div class="body">
                    <h3>${video.titulo || 'Título Indisponível'}</h3>
                    <span class="meta">com <strong>TecnoSenior</strong> · ★★★★★</span>
                    <div class="teacher">
                        <img class="avatar" src="ImgLogo/Play.png" alt="Ícone Play" />
                        <span class="pill">
                            Acessar o vídeo
                        </span>
                    </div>
                </div>
            </a>
            `;

            container.appendChild(card);
        }
    } catch (err) {
        console.error("Erro ao carregar vídeos:", err);
        container.innerHTML = `<p style="color: red;">Erro ao carregar vídeos: ${err.message}. Tente recarregar a página.</p>`;
    }
}


// -------------------------------------------
// 3. Inicialização
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // ESTE CÓDIGO FUNCIONA SEM ALTERAR O HTML.
    checkLoginStatus(); 
    loadVideos();       
});