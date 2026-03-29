// ===========================================
// ARQUIVO: script.js (FINAL COMPLETO E FUNCIONAL)
// ===========================================

// Define a URL base da sua API (onde o server.js está rodando)
const API_BASE_URL = "http://localhost:3001";

/**
 * Esta função é chamada assim que o HTML termina de carregar.
 * Ela orquestra as duas tarefas principais da página.
 */
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus(); 
    loadVideos();       
});


// -------------------------------------------
// TAREFA 1: GERENCIAR BOTÕES DE LOGIN/PERFIL
// -------------------------------------------
function checkLoginStatus() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    // Encontra a barra de navegação
    // Usamos querySelector para encontrar o primeiro .nav-actions (o do header)
    const navActions = document.querySelector('header .nav-actions'); // Seletor mais específico

    if (!navActions) {
        console.error("Barra de navegação (.nav-actions no header) não encontrada.");
        return; 
    }

    // Pega todos os links <a> de dentro da barra de navegação
    const allLinks = navActions.querySelectorAll('a');
    
    // No seu HTML original:
    // allLinks[0] = Login
    // allLinks[1] = Perfil
    // allLinks[2] = Sobre Nós
    
    if (allLinks.length < 3) {
        // Se o JS já adicionou o "Sair", pode ter 4 links, mas o 3º é "Sobre Nós"
        // Se for menor que 3, a estrutura do HTML está errada.
        console.error("Estrutura de links no .nav-actions mudou. JS precisa de ajuste.");
        return; 
    }
    
    const linkLogin = allLinks[0];
    const linkPerfil = allLinks[1];
    
    // Tenta encontrar um botão "Sair" que o JS possa ter criado antes
    let btnLogout = document.getElementById('btn-logout-js'); 
    
    if (usuarioLogado) {
        // --- USUÁRIO ESTÁ LOGADO ---
        
        if (linkLogin) linkLogin.style.display = 'none'; // Esconde "Login"
        
        if (linkPerfil) {
            linkPerfil.style.display = 'block'; // Garante que "Perfil" apareça
            
            // CORRIGE O CAMINHO DO LINK (Este é o caminho que funcionou da última vez)
            // (Baseado na sua estrutura de pastas: telaInicial/ e telaPerfil/ são irmãs)
            linkPerfil.href = "../telaPerfil/telaPerfil.html"; 
            
            try {
                // Personaliza o texto do link
                const user = JSON.parse(usuarioLogado);
                linkPerfil.textContent = `Olá, ${user.username.split(' ')[0]}`;
            } catch (e) {
                linkPerfil.textContent = "Perfil";
            }
        }

        // Cria e adiciona o botão "Sair" (Logout)
        if (!btnLogout) {
            btnLogout = document.createElement('a');
            btnLogout.id = 'btn-logout-js';
            btnLogout.className = 'btn btn-ghost'; // Mesmo estilo do "Sobre Nós" (ou mude se preferir)
            btnLogout.textContent = 'Sair';
            btnLogout.href = '#';
            
            // Insere o "Sair" logo após o "Perfil"
            navActions.insertBefore(btnLogout, linkPerfil.nextSibling); 
            
            // Adiciona a funcionalidade de logout
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('usuarioLogado');
                alert("Você saiu da sua conta.");
                window.location.reload(); // Recarrega a página
            });
        }
        
    } else {
        // --- USUÁRIO NÃO ESTÁ LOGADO ---
        
        if (linkLogin) linkLogin.style.display = 'block'; // Mostra "Login"
        if (linkPerfil) {
            linkPerfil.style.display = 'none'; // Esconde "Perfil"
        }
        
        // Se o botão "Sair" existir de uma sessão anterior, remove
        if (btnLogout) {
             btnLogout.remove();
        }
    }
}


// -------------------------------------------
// TAREFA 2: CARREGAR VÍDEOS DO BANCO (NO CONTAINER VAZIO)
// -------------------------------------------
async function loadVideos() {
    
    // Encontra o container dos cards usando o seletor mais específico:
    // O <div class="cards"> que está DENTRO da <section id="cursos">
    const container = document.querySelector('#cursos .cards');
    
    if (!container) {
        console.error("Container de vídeos (#cursos .cards) não encontrado.");
        return;
    }

    // Como o HTML agora está VAZIO, esta linha só mostra o "Carregando"
    // e não apaga mais os 4 cards fixos (pois eles não existem mais no HTML)
    container.innerHTML = "<p>Carregando vídeos...</p>"; 

    try {
        // 1. Faz a chamada para a API (server.js)
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
        
        // 2. Limpa a mensagem "Carregando..."
        container.innerHTML = ""; 
        
        if (!videos || videos.length === 0) {
            container.innerHTML = "<p>Nenhum vídeo disponível no momento.</p>";
            return;
        }

        // 3. Cria os cards dinâmicos (um para cada vídeo do banco)
        for (const video of videos) {
            const card = document.createElement("article");
            card.className = "card"; // Usa a mesma classe dos seus cards fixos
            card.setAttribute("role", "listitem");

            // Define o link para a página de visualização do vídeo
            // (Baseado na sua estrutura: telaInicial/ e telaPagVideo/ são irmãs)
            const linkParaVideo = `../telaPagVideo/telaPagVideo.html?id=${video.id}`;

            // Preenche o card com os dados do vídeo
            card.innerHTML = `
            <a href="${linkParaVideo}" class="card-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                
                <img src="${video.imagem_capa || 'https://placehold.co/300x180/EFEFEF/AAAAAA?text=Imagem+Indisponível'}"'}" alt="Thumbnail do vídeo ${video.titulo || 'Sem título'}" onerror="this.onerror=null; this.src='https://placehold.co/300x180/EFEFEF/AAAAAA?text=Imagem+Indisponível';">
                
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

            // Adiciona o card novo ao container
            container.appendChild(card);
        }
    } catch (err) {
        console.error("Erro ao carregar vídeos:", err);
        container.innerHTML = `<p style="color: red;">Erro ao carregar vídeos: ${err.message}. Tente recarregar a página.</p>`;
    }
}