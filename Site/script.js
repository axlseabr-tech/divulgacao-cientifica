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

  const defaultComments = [
    {
      name: "Prof. Marcos Vinícius Andrade",
      role: "Professor(a) • Ensino Fundamental II",
      stars: 5,
      date: "Hoje às 15:42",
      text: "Apliquei o Prompt Mestre 1 com meus alunos do 9º ano em Boa Vista. A estratégia de raciocínio inverso e veto a alucinações aritméticas fez toda a diferença. O modelo não errou os cálculos de volume de prismas nem cilindros. Excelente material!"
    },
    {
      name: "Dra. Carolina Mendes",
      role: "Pesquisador(a) • Educação Matemática",
      stars: 5,
      date: "Ontem às 18:20",
      text: "A fundamentação epistemológica articulando Chevallard e Selwyn ficou impecável. É raro ver propostas de IA na educação com tanto rigor teórico e salvaguardas reais de auditoria docente. Parabéns pelo projeto!"
    }
  ];

  function getComments() {
    const saved = localStorage.getItem('scientific_portal_comments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultComments;
      }
    }
    return defaultComments;
  }

  function renderComments() {
    const comments = getComments();
    feed.innerHTML = '';

    comments.forEach(item => {
      const card = document.createElement('div');
      card.className = 'comment-card-item';

      const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const starsStr = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);

      card.innerHTML = `
        <div class="comment-header-row">
          <div class="commenter-meta">
            <div class="commenter-avatar">${initials}</div>
            <div>
              <div class="commenter-name">${escapeHTML(item.name)}</div>
              <div class="commenter-role">${escapeHTML(item.role)} • <span style="opacity: 0.7;">${item.date}</span></div>
            </div>
          </div>
          <div class="comment-stars" title="${item.stars} de 5 estrelas">${starsStr}</div>
        </div>
        <p class="comment-body-text">${escapeHTML(item.text)}</p>
      `;

      feed.appendChild(card);
    });
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('comment-name');
      const roleInput = document.getElementById('comment-role');
      const ratingInput = document.getElementById('comment-rating');
      const institutionInput = document.getElementById('comment-institution');
      const messageInput = document.getElementById('comment-message');

      const name = nameInput.value.trim();
      const role = roleInput.value;
      const inst = institutionInput.value.trim();
      const rating = parseInt(ratingInput.value) || 5;
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const fullRole = inst ? `${role} (${inst})` : role;
      const now = new Date();
      const dateFormatted = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const newComment = {
        name: name,
        role: fullRole,
        stars: rating,
        date: dateFormatted,
        text: message
      };

      const currentComments = getComments();
      currentComments.unshift(newComment);
      localStorage.setItem('scientific_portal_comments', JSON.stringify(currentComments));

      renderComments();
      form.reset();
      showToast('Obrigado! Seu comentário foi publicado com sucesso no mural!');
    });
  }

  renderComments();
}
