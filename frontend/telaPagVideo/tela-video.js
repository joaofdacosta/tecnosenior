// ===========================================
// ARQUIVO: tela-video.js
// ===========================================

const API_BASE_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", async () => {
    
    // --- Elementos ---
    const titulo = document.getElementById("video-titulo");
    const descricao = document.getElementById("video-descricao");
    const dataPostagem = document.getElementById("video-data");
    const categoria = document.getElementById("video-categoria");
    const player = document.getElementById("video-player");
    const source = document.getElementById("video-source");
    
    const btnAnterior = document.getElementById("link-anterior");
    const btnProxima = document.getElementById("link-proxima");
    const btnCurtir = document.getElementById("btn-curtir");
    const btnFavoritar = document.getElementById("btn-favoritar");
    
    const listaLateral = document.getElementById("lista-proximas-aulas");

    // 1. PEGAR ID DA URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = parseInt(urlParams.get('id'));

    if (!currentId) {
        titulo.textContent = "Erro: Nenhum vídeo selecionado.";
        return;
    }

    // --- FUNÇÃO 1: CARREGAR O VÍDEO ATUAL ---
    async function carregarVideoPrincipal() {
        try {
            const response = await fetch(`${API_BASE_URL}/videos/${currentId}`);
            if (!response.ok) throw new Error("Vídeo não encontrado");
            
            const video = await response.json();

            titulo.textContent = video.titulo;
            descricao.textContent = video.descricao;
            categoria.textContent = video.categoria || "Aula";
            
            if (video.data_postagem) {
                const data = new Date(video.data_postagem);
                dataPostagem.textContent = "Postado em: " + data.toLocaleDateString('pt-BR');
            }

            const urlVideo = video.url_do_video_local; 
            if (urlVideo) {
                source.src = urlVideo;
                player.load(); 
            } else {
                descricao.textContent += " (Erro: Vídeo indisponível)";
            }

            // Botões de Navegação
            if (currentId > 1) {
                btnAnterior.href = `telaPagVideo.html?id=${currentId - 1}`;
            } else {
                btnAnterior.classList.add("disabled");
                btnAnterior.textContent = "Início do Curso";
            }
            btnProxima.href = `telaPagVideo.html?id=${currentId + 1}`;

        } catch (err) {
            console.error(err);
            titulo.textContent = "Erro ao carregar vídeo.";
        }
    }

    // --- FUNÇÃO 2: CARREGAR PLAYLIST LATERAL ---
    async function carregarListaLateral() {
        if (!listaLateral) return;
        listaLateral.innerHTML = "<p>Carregando aulas...</p>";

        try {
            const response = await fetch(`${API_BASE_URL}/videos`);
            const videos = await response.json();
            listaLateral.innerHTML = ""; 

            videos.forEach(video => {
                const link = document.createElement("a");
                link.className = "sidebar-item";
                link.href = `telaPagVideo.html?id=${video.id}`;

                if (video.id === currentId) {
                    link.classList.add("active");
                    link.innerHTML = `
                        <div class="sidebar-title">▶ Tocando agora:</div>
                        <div class="sidebar-title">${video.titulo}</div>
                    `;
                } else {
                    link.innerHTML = `
                        <div class="sidebar-title">${video.titulo}</div>
                        <div class="sidebar-meta">Clique para assistir</div>
                    `;
                }
                listaLateral.appendChild(link);
            });
        } catch (error) {
            listaLateral.innerHTML = "<p>Não foi possível carregar a lista.</p>";
        }
    }

    await carregarVideoPrincipal(); 
    carregarListaLateral();         

    // --- INTERATIVIDADE ---
    if (btnCurtir) {
        btnCurtir.onclick = function() {
            this.classList.toggle("active");
            this.textContent = this.classList.contains("active") ? "👍 Curtido" : "👍 Curtir";
        };
    }
    if (btnFavoritar) {
        btnFavoritar.onclick = function() {
            this.classList.toggle("active");
            this.textContent = this.classList.contains("active") ? "❤️ Favorito!" : "❤️ Favoritar";
        };
    }

    const btnEnviar = document.getElementById("btn-enviar-comentario");
    const campoTexto = document.getElementById("campo-comentario");
    const listaComentarios = document.getElementById("lista-comentarios");

    if (btnEnviar && campoTexto && listaComentarios) {
        btnEnviar.addEventListener("click", () => {
            const texto = campoTexto.value.trim();
            if (texto === "") {
                alert("Escreva algo antes de enviar.");
                return;
            }
            
            let nomeUsuario = "Você";
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            if (usuarioLogado) {
                try {
                    const user = JSON.parse(usuarioLogado);
                    nomeUsuario = user.username.split(' ')[0]; 
                } catch (e) {}
            }

            const novoComentario = document.createElement("div");
            novoComentario.className = "comment-item";
            novoComentario.innerHTML = `
                <strong style="color: #24483e;">${nomeUsuario}:</strong> 
                <div style="margin-top: 5px;">"${texto}"</div>
            `;
            
            listaComentarios.appendChild(novoComentario);
            campoTexto.value = "";
        });
    }
});