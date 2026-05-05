/* ═══════════════════════════════════════════════════
   INTEC Assessoria Contábil — script.js
   Funcionalidades: header, reveal, mobile menu, form
════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. Header: scroll effect ─── */
(function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
})();


/* ─── 2. Menu mobile (hambúrguer) ─── */
(function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;

  // Abre/fecha o menu
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha ao clicar em um link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ─── 3. Scroll Reveal com IntersectionObserver ─── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Se o browser não suporta IntersectionObserver, mostra tudo
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Para de observar após revelar (performance)
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px', // revela um pouco antes de entrar no viewport
    threshold: 0.08
  });

  elements.forEach(el => observer.observe(el));
})();


/* ─── 4. Formulário de Contato (Formspree + validação) ─── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  const errorMsg   = document.getElementById('formError');

  // Campos e suas mensagens de erro
  const fields = [
    { id: 'name',    errorId: 'nameError',    validate: v => v.trim().length >= 2 },
    { id: 'email',   errorId: 'emailError',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'message', errorId: 'messageError', validate: v => v.trim().length >= 10 },
  ];

  // Valida um campo individualmente
  function validateField(field) {
    const el     = document.getElementById(field.id);
    const group  = el.closest('.form-group');
    const isValid = field.validate(el.value);

    group.classList.toggle('has-error', !isValid);
    el.classList.toggle('is-invalid', !isValid);
    return isValid;
  }

  // Limpa o erro quando o usuário começa a digitar
  fields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;

    el.addEventListener('input', () => {
      const group = el.closest('.form-group');
      if (group.classList.contains('has-error')) {
        validateField(field);
      }
    });

    // Valida ao perder o foco (UX: feedback progressivo)
    el.addEventListener('blur', () => validateField(field));
  });

  // Esconde feedbacks globais
  function hideFeedbacks() {
    successMsg.classList.remove('show');
    errorMsg.classList.remove('show');
  }

  // Estado de loading do botão
  function setLoading(isLoading) {
    submitBtn.classList.toggle('btn--loading', isLoading);
    submitBtn.disabled = isLoading;
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFeedbacks();

    // Valida todos os campos
    const isFormValid = fields.every(field => validateField(field));
    if (!isFormValid) {
      // Foca no primeiro campo inválido
      const firstInvalid = fields.find(f => !document.getElementById(f.id)
        .closest('.form-group').classList.contains('has-error') === false);
      if (firstInvalid) document.getElementById(firstInvalid.id).focus();
      return;
    }

    setLoading(true);

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Sucesso!
        successMsg.classList.add('show');
        form.reset();
        // Rola suavemente para a mensagem de sucesso
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Esconde a mensagem após 6 segundos
        setTimeout(() => successMsg.classList.remove('show'), 6000);
      } else {
        throw new Error('Resposta não OK: ' + response.status);
      }

    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      errorMsg.classList.add('show');
      setTimeout(() => errorMsg.classList.remove('show'), 6000);

    } finally {
      setLoading(false);
    }
  });
})();


/* ─── 5. Smooth scroll para links âncora ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ─── 6. Microinteração: ripple nos botões ─── */
(function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Não aplica ripple em botões desabilitados
      if (this.disabled) return;

      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position:     'absolute',
        width:        `${size}px`,
        height:       `${size}px`,
        left:         `${x}px`,
        top:          `${y}px`,
        background:   'rgba(255,255,255,0.25)',
        borderRadius: '50%',
        transform:    'scale(0)',
        pointerEvents:'none',
        animation:    'rippleAnim 0.55s ease-out forwards',
      });

      // Garante position:relative no botão para o ripple funcionar
      if (getComputedStyle(this).position === 'static') {
        this.style.position = 'relative';
      }

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Injeta o keyframe de ripple se ainda não existir
  if (!document.getElementById('rippleStyle')) {
    const style = document.createElement('style');
    style.id = 'rippleStyle';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ─── 7. Contador animado nas estatísticas do hero ─── */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-card__number');
  if (!statNumbers.length) return;

  function animateCounter(el) {
    const text   = el.textContent.trim();
    const prefix = text.match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = text.match(/[^0-9]*$/)?.[0] ?? '';
    const target = parseInt(text.replace(/\D/g, ''), 10);

    if (isNaN(target) || target === 0) return;

    const duration   = 1800;
    const startTime  = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutExpo
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Usa IntersectionObserver para disparar o counter quando visível
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  } else {
    statNumbers.forEach(animateCounter);
  }
})();