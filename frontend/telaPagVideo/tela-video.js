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
    const currentId = parseInt(urlParams.get("id"), 10);

    if (!currentId) {
        titulo.textContent = "Erro: Nenhum vídeo selecionado.";
        return;
    }

    
// --- USUÁRIO LOGADO ---
let usuarioId = null;
const usuarioLogado = localStorage.getItem("usuarioLogado");

if (usuarioLogado) {
    try {
        const user = JSON.parse(usuarioLogado);
        usuarioId = user.id;

        // Atualiza navbar com nome do usuário e botão Sair
        const nav = document.querySelector('header .header-actions');
        if (nav) {
            const linkPerfil = nav.querySelector('a[href*="telaPerfil"]');
            if (linkPerfil) {
                const firstName = user.username ? user.username.split(' ')[0] : '';
                linkPerfil.textContent = `Meu Perfil (${firstName})`;
            }
            if (!document.getElementById('btn-sair-video')) {
                const btnSair = document.createElement('a');
                btnSair.id = 'btn-sair-video';
                btnSair.className = 'btn btn-ghost';
                btnSair.href = '#';
                btnSair.textContent = 'Sair';
                btnSair.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('usuarioLogado');
                    window.location.href = '../telaLogin/telaLogin.html';
                });
                nav.appendChild(btnSair);
            }
        }
    } catch (e) {
        console.error("Erro ao ler usuário logado:", e);
    }
}

    // --- ESTADO DOS BOTÕES ---
    let estadoInteracao = {
        curtido: false,
        favoritado: false
    };

    function atualizarBotoes() {
        if (btnCurtir) {
            btnCurtir.classList.toggle("active", estadoInteracao.curtido);
            btnCurtir.textContent = estadoInteracao.curtido ? "👍 Curtido" : "👍 Curtir";
        }

        if (btnFavoritar) {
            btnFavoritar.classList.toggle("active", estadoInteracao.favoritado);
            btnFavoritar.textContent = estadoInteracao.favoritado ? "❤️ Favorito!" : "❤️ Favoritar";
        }
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
                dataPostagem.textContent = "Postado em: " + data.toLocaleDateString("pt-BR");
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
            console.error(error);
            listaLateral.innerHTML = "<p>Não foi possível carregar a lista.</p>";
        }
    }

    // --- FUNÇÃO 3: CARREGAR INTERAÇÃO DO USUÁRIO ---
    async function carregarInteracao() {
        atualizarBotoes();

        if (!usuarioId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/videos/${currentId}/interacao/${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar interação");

            const dados = await response.json();

            estadoInteracao.curtido = !!dados.curtido;
            estadoInteracao.favoritado = !!dados.favoritado;
            atualizarBotoes();
        } catch (error) {
            console.error("Erro ao carregar interação:", error);
        }
    }

    await carregarVideoPrincipal();
    await carregarListaLateral();
    await carregarInteracao();
    await carregarComentarios();

    // --- INTERATIVIDADE CURTIR ---
    if (btnCurtir) {
        btnCurtir.addEventListener("click", async () => {
            if (!usuarioId) {
                alert("Você precisa estar logado para curtir.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/videos/${currentId}/curtir`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ usuarioId })
                });

                const dados = await response.json();

                if (!response.ok) {
                    throw new Error(dados.erro || "Erro ao curtir vídeo");
                }

                estadoInteracao.curtido = !!dados.curtido;
                estadoInteracao.favoritado = !!dados.favoritado;
                atualizarBotoes();
            } catch (error) {
                console.error("Erro no clique de curtir:", error);
                alert("Não foi possível salvar a curtida.");
            }
        });
    }

    // --- INTERATIVIDADE FAVORITAR ---
    if (btnFavoritar) {
        btnFavoritar.addEventListener("click", async () => {
            if (!usuarioId) {
                alert("Você precisa estar logado para favoritar.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/videos/${currentId}/favoritar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ usuarioId })
                });

                const dados = await response.json();

                if (!response.ok) {
                    throw new Error(dados.erro || "Erro ao favoritar vídeo");
                }

                estadoInteracao.curtido = !!dados.curtido;
                estadoInteracao.favoritado = !!dados.favoritado;
                atualizarBotoes();
            } catch (error) {
                console.error("Erro no clique de favoritar:", error);
                alert("Não foi possível salvar o favorito.");
            }
        });
    }

    function criarComentarioHTML(nomeUsuario, texto) {
    const novoComentario = document.createElement("div");
    novoComentario.className = "comment-item";
    novoComentario.innerHTML = `
        <strong style="color: #24483e;">${nomeUsuario}:</strong>
        <div style="margin-top: 5px;">"${texto}"</div>
    `;
    return novoComentario;
}

async function carregarComentarios() {
    const listaComentarios = document.getElementById("lista-comentarios");
    if (!listaComentarios) return;

    listaComentarios.innerHTML = "<p>Carregando comentários...</p>";

    try {
        const response = await fetch(`${API_BASE_URL}/videos/${currentId}/comentarios`);
        if (!response.ok) throw new Error("Erro ao buscar comentários");

        const comentarios = await response.json();
        listaComentarios.innerHTML = "";

        if (comentarios.length === 0) {
            listaComentarios.innerHTML = "<p>Ainda não há comentários neste vídeo.</p>";
            return;
        }

        comentarios.forEach(comentario => {
            const primeiroNome = comentario.username ? comentario.username.split(" ")[0] : "Usuário";
            const item = criarComentarioHTML(primeiroNome, comentario.texto);
            listaComentarios.appendChild(item);
        });
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        listaComentarios.innerHTML = "<p>Não foi possível carregar os comentários.</p>";
    }
}

    // --- COMENTÁRIOS ---
const btnEnviar = document.getElementById("btn-enviar-comentario");
const campoTexto = document.getElementById("campo-comentario");
const listaComentarios = document.getElementById("lista-comentarios");

if (btnEnviar && campoTexto && listaComentarios) {
    btnEnviar.addEventListener("click", async () => {
        const texto = campoTexto.value.trim();

        if (!usuarioId) {
            alert("Você precisa estar logado para comentar.");
            return;
        }

        if (texto === "") {
            alert("Escreva algo antes de enviar.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/videos/${currentId}/comentarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuarioId,
                    texto
                })
            });

            const dados = await response.json();

            if (!response.ok) {
                throw new Error(dados.erro || "Erro ao salvar comentário");
            }

            const primeiroNome = dados.username ? dados.username.split(" ")[0] : "Usuário";
            const novoComentario = criarComentarioHTML(primeiroNome, dados.texto);

            const mensagemVazia = listaComentarios.querySelector("p");
            if (mensagemVazia) {
                listaComentarios.innerHTML = "";
            }

            listaComentarios.appendChild(novoComentario);
            campoTexto.value = "";
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            alert("Não foi possível salvar o comentário.");
        }
    });
}
});