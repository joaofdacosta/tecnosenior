const _CHAVE_PERMISSAO = 'ts_notif_permissao';
const _CHAVE_VIDEOS = 'ts_videos_conhecidos';
const _CHAVE_RECEM_LOGADO = 'ts_recem_logado';

function _criarPopupPermissao() {
    const overlay = document.createElement('div');
    overlay.id = 'ts-notif-overlay';
    overlay.className = 'ts-notif-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ts-notif-titulo');

    overlay.innerHTML = `
        <div class="ts-notif-modal">
            <div class="ts-notif-icone" aria-hidden="true">🔔</div>
            <h2 id="ts-notif-titulo" class="ts-notif-h2">Ativar Notificações</h2>
            <p class="ts-notif-p">
                Deseja receber avisos quando houver novos vídeos e conteúdos no TecnoSenior?
            </p>
            <div class="ts-notif-botoes">
                <button id="ts-btn-permitir" class="ts-btn-primary">Sim, quero avisos!</button>
                <button id="ts-btn-negar" class="ts-btn-ghost">Não, obrigado</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('ts-btn-permitir').addEventListener('click', async () => {
        overlay.remove();
        await _solicitarPermissaoNavegador();
    });

    document.getElementById('ts-btn-negar').addEventListener('click', () => {
        localStorage.setItem(_CHAVE_PERMISSAO, 'negado');
        overlay.remove();
    });
}

async function _solicitarPermissaoNavegador() {
    if (!('Notification' in window)) {
        localStorage.setItem(_CHAVE_PERMISSAO, 'negado');
        return;
    }

    const resultado = await Notification.requestPermission();
    localStorage.setItem(_CHAVE_PERMISSAO, resultado === 'granted' ? 'aceito' : 'negado');

    if (resultado === 'granted') {
        _processarRecemLogado();
        _verificarNovosVideos();
    }
}

function _enviarNotificacao(titulo, corpo) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(titulo, { body: corpo });
}

function _mostrarToastBemVindo(titulo, corpo) {
    const toast = document.createElement('div');
    toast.className = 'ts-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
        <div class="ts-toast-icone" aria-hidden="true">👋</div>
        <div class="ts-toast-conteudo">
            <div class="ts-toast-titulo">${titulo}</div>
            <div class="ts-toast-corpo">${corpo}</div>
        </div>
        <button class="ts-toast-fechar" aria-label="Fechar notificação">✕</button>
    `;

    document.body.appendChild(toast);

    const fechar = () => {
        toast.classList.add('ts-toast-saindo');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    toast.querySelector('.ts-toast-fechar').addEventListener('click', fechar);
    setTimeout(fechar, 5000);
}

function _processarRecemLogado() {
    if (!sessionStorage.getItem(_CHAVE_RECEM_LOGADO)) return;
    sessionStorage.removeItem(_CHAVE_RECEM_LOGADO);

    const usuarioStr = localStorage.getItem('usuarioLogado');
    let titulo, corpo;

    try {
        const usuario = JSON.parse(usuarioStr);
        const primeiroNome = usuario && usuario.username ? usuario.username.split(' ')[0] : 'amigo(a)';
        titulo = `Bem-vindo(a) de volta, ${primeiroNome}!`;
        corpo = 'Que bom ter você aqui! Confira os vídeos disponíveis no TecnoSenior.';
    } catch (e) {
        titulo = 'Bem-vindo(a) de volta!';
        corpo = 'Que bom ter você aqui! Confira os vídeos disponíveis no TecnoSenior.';
    }

    // Toast visual dentro da página — funciona sempre, sem precisar de permissão
    _mostrarToastBemVindo(titulo, corpo);
    // Notificação do SO como bônus, se o usuário tiver permitido
    _enviarNotificacao(titulo, corpo);
}

async function _verificarNovosVideos() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/videos`);
        if (!response.ok) return;

        const videos = await response.json();
        const idsAtuais = videos.map(v => String(v.id));

        const armazenados = localStorage.getItem(_CHAVE_VIDEOS);

        if (armazenados === null) {
            localStorage.setItem(_CHAVE_VIDEOS, JSON.stringify(idsAtuais));
            return;
        }

        const idsConhecidos = JSON.parse(armazenados);
        const novosVideos = videos.filter(v => !idsConhecidos.includes(String(v.id)));

        if (novosVideos.length === 1) {
            _enviarNotificacao(
                'Novo vídeo disponível!',
                `"${novosVideos[0].titulo}" acabou de chegar. Venha conferir!`
            );
        } else if (novosVideos.length > 1) {
            _enviarNotificacao(
                `${novosVideos.length} novos vídeos disponíveis!`,
                'Acesse o TecnoSenior e confira as novas aulas.'
            );
        }

        localStorage.setItem(_CHAVE_VIDEOS, JSON.stringify(idsAtuais));
    } catch (e) {
        // Falha silenciosa — notificações não são críticas
    }
}

function inicializarNotificacoes() {
    // Toast de boas-vindas sempre exibe na interface, sem depender de permissão do SO
    _processarRecemLogado();

    if (!('Notification' in window)) return;

    const permissao = localStorage.getItem(_CHAVE_PERMISSAO);

    if (permissao === 'aceito' && Notification.permission === 'granted') {
        _verificarNovosVideos();
    } else if (permissao === null) {
        setTimeout(_criarPopupPermissao, 1500);
    }
}
