/**
 * PORTAL DE DIVULGAÇÃO CIENTÍFICA - AXL OLIVEIRA SEABRA
 * Interatividades: Tema Claro/Escuro, Catálogo de Prompts, Player de Áudio,
 * Cópia com 1-Clique, Filtro de Pesquisas e Menu Mobile.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPromptTabs();
  initCopyButtons();
  initCitationTabs();
  initAudioPlayer();
  initRepoFilters();
  initMobileMenu();
  initScrollSpy();
  initCommentsWall();
});

/* ==========================================================================
   1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Recupera tema salvo ou detecta preferência do sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Modo ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`);
    });
  }
}

/* ==========================================================================
   2. ABAS DO CATÁLOGO DE PROMPTS
   ========================================================================== */
function initPromptTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      // Atualiza botões
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Atualiza painéis
      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   3. CÓPIA DE PROMPTS E FEEDBACK TOAST
   ========================================================================== */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-prompt-btn');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetCodeId = button.getAttribute('data-target');
      const codeElement = document.getElementById(targetCodeId);

      if (codeElement) {
        const textToCopy = codeElement.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('✓ Prompt copiado para a área de transferência!');
          
          // Efeito visual no botão
          const originalText = button.innerHTML;
          button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Copiado!
          `;
          button.classList.add('btn-success');

          setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
          }, 2500);
        }).catch(err => {
          console.error('Falha ao copiar texto: ', err);
          showToast('Não foi possível copiar automaticamente.');
        });
      }
    });
  });
}

/* ==========================================================================
   4. ABAS E CÓPIA DE CITAÇÃO CIENTÍFICA (ABNT / BIBTEX)
   ========================================================================== */
function initCitationTabs() {
  const citeTabBtns = document.querySelectorAll('.cite-tab-btn');
  const citePanes = document.querySelectorAll('.cite-pane');
  const copyCiteBtn = document.getElementById('copy-citation-btn');

  citeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const citeType = btn.getAttribute('data-cite');

      citeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      citePanes.forEach(pane => {
        if (pane.id === `cite-${citeType}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  if (copyCiteBtn) {
    copyCiteBtn.addEventListener('click', () => {
      const activePane = document.querySelector('.cite-pane.active code');
      if (activePane) {
        navigator.clipboard.writeText(activePane.innerText).then(() => {
          showToast('✓ Citação copiada com sucesso!');
        });
      }
    });
  }
}

/* ==========================================================================
   5. PLAYER DE ÁUDIO & ACESSIBILIDADE
   ========================================================================== */
function initAudioPlayer() {
  const audio = document.getElementById('main-audio');
  const playBtn = document.getElementById('play-pause-btn');
  const progressBar = document.getElementById('audio-progress');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const playerTitle = document.getElementById('player-title');
  const trackBtns = document.querySelectorAll('.track-btn');
  const playIcon = playBtn ? playBtn.querySelector('.play-icon') : null;
  const pauseIcon = playBtn ? playBtn.querySelector('.pause-icon') : null;

  if (!audio || !playBtn) return;

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Alternar Reproduzir / Pausar
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    } else {
      audio.pause();
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    }
  });

  // Atualiza tempo total quando os metadados carregarem
  audio.addEventListener('loadedmetadata', () => {
    if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
  });

  // Atualiza barra de progresso durante reprodução
  audio.addEventListener('timeupdate', () => {
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    if (progressBar && audio.duration) {
      progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
  });

  // Salto na barra de progresso
  if (progressBar) {
    progressBar.addEventListener('input', () => {
      if (audio.duration) {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
      }
    });
  }

  // Quando o áudio terminar
  audio.addEventListener('ended', () => {
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (progressBar) progressBar.value = 0;
  });

  // Alternar faixas de áudio
  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-src');
      const title = btn.getAttribute('data-title');

      trackBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (playerTitle) playerTitle.textContent = title;
      
      const wasPlaying = !audio.paused;
      audio.src = src;
      audio.load();

      if (wasPlaying) {
        audio.play();
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
      } else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   6. FILTRO DE PESQUISAS DO REPOSITÓRIO
   ========================================================================== */
function initRepoFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const repoCards = document.querySelectorAll('.repo-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      repoCards.forEach(card => {
        const categories = card.getAttribute('data-category');
        if (filter === 'all' || (categories && categories.includes(filter))) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease-in-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. MENU MOBILE (HAMBURGER)
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   8. SCROLL SPY (INDICADOR DE SEÇÃO ATIVA NA BARRA)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   NOTIFICAÇÃO TOAST FLUTUANTE
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

/* ==========================================================================
   8. MURAL DE COMENTÁRIOS E FEEDBACK (COM PERSISTÊNCIA LOCALSTORAGE)
   ========================================================================== */
function initCommentsWall() {
  const form = document.getElementById('comment-form');
  const feed = document.getElementById('comments-feed');
  if (!feed) return;

  const STORAGE_KEY = 'scientific_portal_comments_v3';

  const REACTIONS = [
    { emoji: '👍', label: 'Gostei' },
    { emoji: '❤️', label: 'Amei' },
    { emoji: '🎉', label: 'Parabéns' },
    { emoji: '🔥', label: 'Incrível' },
  ];

  const defaultComments = [];

  function getComments() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultComments;
  }

  function saveComments(comments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str || '';
    return p.innerHTML;
  }

  function genId() {
    return 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  function nowStr() {
    const now = new Date();
    return `Hoje às ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  }

  /* ── Renderiza um reply-card (aceita reply de reply) ── */
  function buildReplyCard(reply, parentId, replyIndex, comments, depth) {
    const initials = reply.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
    const starsStr  = '★'.repeat(reply.stars||0) + '☆'.repeat(5-(reply.stars||0));

    const div = document.createElement('div');
    div.className = 'reply-card';
    div.id = `reply-${parentId}-${replyIndex}`;

    /* Reações do reply */
    const reactionBtns = REACTIONS.map(r => {
      const count = (reply.reactions && reply.reactions[r.emoji]) || 0;
      const active = reply.userReactions && reply.userReactions.includes(r.emoji) ? 'active' : '';
      return `<button class="reaction-btn ${active}"
                data-parent="${parentId}" data-reply="${replyIndex}"
                data-emoji="${r.emoji}" title="${r.label}" aria-label="${r.label}">
                ${r.emoji} <span class="reaction-count">${count > 0 ? count : ''}</span>
              </button>`;
    }).join('');

    /* Reply de reply — apenas 1 nível adicional de profundidade */
    const canReplyAgain = depth < 2;
    const replyBtn = canReplyAgain
      ? `<button class="reply-toggle-btn" data-parent="${parentId}" data-reply="${replyIndex}" data-depth="${depth}">💬 Responder</button>`
      : '';

    div.innerHTML = `
      <div class="comment-header-row">
        <div class="commenter-meta">
          <div class="commenter-avatar">${initials}</div>
          <div>
            <div class="commenter-name">${escapeHTML(reply.name)}</div>
            <div class="commenter-role">${escapeHTML(reply.role||'')} ${reply.date ? `• <span style="opacity:0.7">${reply.date}</span>` : ''}</div>
          </div>
        </div>
        ${reply.stars ? `<div class="comment-stars" title="${reply.stars} de 5">${starsStr}</div>` : ''}
      </div>
      <p class="comment-body-text">${escapeHTML(reply.text)}</p>
      <div class="comment-actions-bar">
        ${reactionBtns}
        ${replyBtn}
      </div>
      <div class="reply-form-placeholder-${parentId}-${replyIndex}"></div>
      <div class="nested-replies-${parentId}-${replyIndex}"></div>
    `;

    /* Sub-replies */
    if (reply.replies && reply.replies.length > 0 && depth < 2) {
      const nested = div.querySelector(`.nested-replies-${parentId}-${replyIndex}`);
      const nestedSection = document.createElement('div');
      nestedSection.className = 'replies-section';
      reply.replies.forEach((sr, si) => {
        nestedSection.appendChild(buildReplyCard(sr, `${parentId}-${replyIndex}`, si, comments, depth + 1));
      });
      nested.appendChild(nestedSection);
    }

    return div;
  }

  /* ── Renderiza um card principal ── */
  function buildCard(item, index, comments) {
    const initials = item.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
    const starsStr  = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);

    const card = document.createElement('div');
    card.className = 'comment-card-item';
    card.id = `card-${item.id}`;

    /* Reações */
    const reactionBtns = REACTIONS.map(r => {
      const count  = (item.reactions && item.reactions[r.emoji]) || 0;
      const active = item.userReactions && item.userReactions.includes(r.emoji) ? 'active' : '';
      return `<button class="reaction-btn ${active}"
                data-id="${item.id}" data-emoji="${r.emoji}"
                title="${r.label}" aria-label="${r.label}">
                ${r.emoji} <span class="reaction-count">${count > 0 ? count : ''}</span>
              </button>`;
    }).join('');

    /* Badge lido */
    const badgeLido = item.read
      ? `<div class="badge-lido">✓ Lido pelo Autor</div>`
      : '';

    card.innerHTML = `
      ${badgeLido}
      <div class="comment-header-row" style="${item.read ? 'padding-right:120px' : ''}">
        <div class="commenter-meta">
          <div class="commenter-avatar">${initials}</div>
          <div>
            <div class="commenter-name">${escapeHTML(item.name)}</div>
            <div class="commenter-role">${escapeHTML(item.role)} • <span style="opacity:0.7">${item.date}</span></div>
          </div>
        </div>
        <div class="comment-stars" title="${item.stars} de 5 estrelas">${starsStr}</div>
      </div>
      <p class="comment-body-text">${escapeHTML(item.text)}</p>
      <div class="comment-actions-bar">
        ${reactionBtns}
        <button class="reply-toggle-btn" data-id="${item.id}">💬 Responder</button>
        ${!item.read ? `<button class="mark-read-btn" data-id="${item.id}">✓ Marcar como lido</button>` : ''}
      </div>
      <div class="reply-form-placeholder-${item.id}"></div>
      <div class="replies-wrapper-${item.id}"></div>
    `;

    /* Renderiza replies existentes */
    if (item.replies && item.replies.length > 0) {
      const wrapper = card.querySelector(`.replies-wrapper-${item.id}`);
      const section = document.createElement('div');
      section.className = 'replies-section';
      item.replies.forEach((r, ri) => {
        section.appendChild(buildReplyCard(r, item.id, ri, comments, 1));
      });
      wrapper.appendChild(section);
    }

    return card;
  }

  /* ── Renderiza o feed completo ── */
  function renderComments() {
    const comments = getComments();
    feed.innerHTML = '';

    if (comments.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 28px 16px; background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); border: 1px dashed rgba(255,255,255,0.12);">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 8px;">✍️</span>
          <strong>Mural limpo e pronto!</strong>
          <p style="font-size: 0.82rem; margin-top: 4px; opacity: 0.8;">Seja o primeiro a publicar um depoimento ou avaliação sobre o portal.</p>
        </div>
      `;
      return;
    }

    comments.forEach((item, index) => {
      feed.appendChild(buildCard(item, index, comments));
    });
    attachListeners();
  }

  /* ── Mostra formulário inline de resposta ── */
  function showReplyForm(placeholderSel, onSubmit, onCancel) {
    const placeholder = document.querySelector(placeholderSel);
    if (!placeholder || placeholder.querySelector('.reply-form-inline')) return;

    const form = document.createElement('div');
    form.className = 'reply-form-inline';
    form.innerHTML = `
      <input type="text" class="reply-name-in" placeholder="Seu nome" maxlength="60" required>
      <textarea class="reply-text-in" rows="2" placeholder="Escreva sua resposta..." required></textarea>
      <div class="reply-form-row">
        <button class="reply-submit-btn">Enviar resposta</button>
        <button class="reply-cancel-btn">Cancelar</button>
      </div>
    `;

    form.querySelector('.reply-submit-btn').addEventListener('click', () => {
      const nameVal = form.querySelector('.reply-name-in').value.trim();
      const textVal = form.querySelector('.reply-text-in').value.trim();
      if (!nameVal || !textVal) return;
      onSubmit(nameVal, textVal);
    });

    form.querySelector('.reply-cancel-btn').addEventListener('click', () => {
      form.remove();
      if (onCancel) onCancel();
    });

    placeholder.appendChild(form);
    form.querySelector('.reply-name-in').focus();
  }

  /* ── Listeners delegados ao feed ── */
  function attachListeners() {

    /* Reação em comentário principal */
    feed.querySelectorAll('.reaction-btn[data-id]:not([data-parent])').forEach(btn => {
      btn.addEventListener('click', () => {
        const comments = getComments();
        const id       = btn.dataset.id;
        const emoji    = btn.dataset.emoji;
        const item     = comments.find(c => c.id === id);
        if (!item) return;

        item.reactions = item.reactions || {};
        item.userReactions = item.userReactions || [];

        if (item.userReactions.includes(emoji)) {
          item.reactions[emoji] = Math.max(0, (item.reactions[emoji] || 1) - 1);
          item.userReactions    = item.userReactions.filter(e => e !== emoji);
        } else {
          item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
          item.userReactions.push(emoji);
        }
        saveComments(comments);
        renderComments();
      });
    });

    /* Reação em reply */
    feed.querySelectorAll('.reaction-btn[data-parent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const comments    = getComments();
        const parentId    = btn.dataset.parent;
        const replyIndex  = parseInt(btn.dataset.reply);
        const emoji       = btn.dataset.emoji;

        /* Suporte a nested: parentId pode ser "seed-1-0" */
        const parts  = parentId.split('-');
        const rootId = parts.slice(0, 2).join('-');
        const root   = comments.find(c => c.id === rootId);
        if (!root) return;

        let reply;
        if (parts.length === 2) {
          reply = root.replies[replyIndex];
        } else {
          const midIndex = parseInt(parts[2]);
          reply = root.replies[midIndex]?.replies?.[replyIndex];
        }
        if (!reply) return;

        reply.reactions    = reply.reactions    || {};
        reply.userReactions = reply.userReactions || [];

        if (reply.userReactions.includes(emoji)) {
          reply.reactions[emoji] = Math.max(0, (reply.reactions[emoji]||1) - 1);
          reply.userReactions    = reply.userReactions.filter(e => e !== emoji);
        } else {
          reply.reactions[emoji] = (reply.reactions[emoji]||0) + 1;
          reply.userReactions.push(emoji);
        }
        saveComments(comments);
        renderComments();
      });
    });

    /* Botão "Marcar como lido" */
    feed.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const comments = getComments();
        const item     = comments.find(c => c.id === btn.dataset.id);
        if (item) { item.read = true; saveComments(comments); renderComments(); }
      });
    });

    /* Botão Responder em comentário principal */
    feed.querySelectorAll('.reply-toggle-btn[data-id]:not([data-parent])').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        showReplyForm(`.reply-form-placeholder-${id}`, (name, text) => {
          const comments = getComments();
          const item     = comments.find(c => c.id === id);
          if (!item) return;
          item.replies = item.replies || [];
          item.replies.push({
            id: genId(), name, role: 'Visitante', date: nowStr(),
            text, reactions: {}, userReactions: [], replies: []
          });
          saveComments(comments);
          renderComments();
          showToast('Resposta publicada!');
        });
      });
    });

    /* Botão Responder em reply */
    feed.querySelectorAll('.reply-toggle-btn[data-parent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const parentId   = btn.dataset.parent;
        const replyIndex = parseInt(btn.dataset.reply);
        showReplyForm(`.reply-form-placeholder-${parentId}-${replyIndex}`, (name, text) => {
          const comments = getComments();
          const parts    = parentId.split('-');
          const rootId   = parts.slice(0,2).join('-');
          const root     = comments.find(c => c.id === rootId);
          if (!root) return;

          let targetReplies;
          if (parts.length === 2) {
            root.replies[replyIndex].replies = root.replies[replyIndex].replies || [];
            targetReplies = root.replies[replyIndex].replies;
          } else {
            const midIndex = parseInt(parts[2]);
            root.replies[midIndex].replies = root.replies[midIndex].replies || [];
            targetReplies = root.replies[midIndex].replies;
          }
          targetReplies.push({
            id: genId(), name, role: 'Visitante', date: nowStr(),
            text, reactions: {}, userReactions: [], replies: []
          });
          saveComments(comments);
          renderComments();
          showToast('Resposta publicada!');
        });
      });
    });
  }

  /* ── Envio do formulário principal ── */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput        = document.getElementById('comment-name');
      const roleInput        = document.getElementById('comment-role');
      const ratingInput      = document.getElementById('comment-rating');
      const institutionInput = document.getElementById('comment-institution');
      const messageInput     = document.getElementById('comment-message');

      const name    = nameInput.value.trim();
      const role    = roleInput.value;
      const inst    = institutionInput.value.trim();
      const rating  = parseInt(ratingInput.value) || 5;
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const fullRole  = inst ? `${role} (${inst})` : role;
      const newComment = {
        id: genId(),
        name, role: fullRole,
        stars: rating,
        date: nowStr(),
        text: message,
        reactions: { '👍':0, '❤️':0, '🎉':0, '🔥':0 },
        userReactions: [],
        read: false,
        replies: []
      };

      const current = getComments();
      current.unshift(newComment);
      saveComments(current);
      renderComments();
      form.reset();
      showToast('Obrigado! Seu comentário foi publicado com sucesso no mural!');
    });
  }

  renderComments();
}
