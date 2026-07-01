/* ═══════════════════════════════════════════════════════════════════
   PREETILATA PORTFOLIO — script.js  (v3 — Dynamic Gallery)
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Dynamic Gallery Loader ─────────────────────────────────────── */
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  let artworks = [];

  // 1. Load base artworks from JSON
  try {
    const res = await fetch('artworks.json?t=' + Date.now());
    artworks  = await res.json();
  } catch(e) {
    console.warn('artworks.json not found, using hardcoded HTML');
    return; // fall back to hardcoded HTML cards
  }

  // 2. Merge any artworks added via admin panel (localStorage)
  const added = JSON.parse(localStorage.getItem('preeti_artworks_added') || '[]');
  artworks = [...artworks, ...added];

  // 3. Render cards
  grid.innerHTML = artworks.map((art, i) => `
    <article class="artwork-card" data-category="${art.category}" data-aos="zoom-in" data-aos-delay="${Math.min(i * 40, 600)}">
      <div class="artwork-canvas" onclick="openLightbox('${art.image}','${art.title.replace(/'/g,"\\'")}','${art.medium} · ${art.size} · ${art.year}')">
        <img src="${art.image}" alt="${art.title}" class="artwork-real-img" loading="lazy"
          onerror="this.style.opacity='0.15';this.parentElement.style.background='#1a1511'"/>
        <div class="artwork-hover">
          <p class="artwork-hover-desc">${art.hover}</p>
        </div>
      </div>
      <div class="artwork-info">
        <h3 class="artwork-title">${art.title}${art.addedAt ? '<span style="font-size:0.6rem;background:rgba(74,124,89,0.2);border:1px solid rgba(74,124,89,0.4);color:#7abf5a;padding:0.1rem 0.4rem;border-radius:4px;margin-left:0.5rem;vertical-align:middle">New</span>' : ''}</h3>
        <div class="artwork-meta">
          <span class="artwork-medium">${art.medium}</span>
          <span class="artwork-year">${art.year}</span>
        </div>
        <p class="artwork-size">${art.size}</p>
        <p class="artwork-desc">${art.desc}</p>
      </div>
    </article>
  `).join('');

  // 4. Re-init AOS on new elements
  initAOS();
  initFilter();
}

window.addEventListener('DOMContentLoaded', loadGallery);



/* ─── Page Loader ────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 800);
  }, 500);
});

/* ─── Navbar scroll class ────────────────────────────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Mobile Nav Toggle ──────────────────────────────────────────── */
(function () {
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
})();

/* ─── Scroll-triggered Animations (AOS) ─────────────────────────── */
function initAOS() {
  const els = document.querySelectorAll('[data-aos]:not(.aos-animate)');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
      setTimeout(() => el.classList.add('aos-animate'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

window.addEventListener('DOMContentLoaded', initAOS);


/* ─── Counter Animation ──────────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  let done = false;
  const animateAll = () => {
    if (done) return;
    done = true;
    counters.forEach(el => {
      const target   = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1800;
      const step     = target / (duration / 16);
      let current    = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current < target) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    });
  };

  const statsWrap = document.querySelector('.about-stats');
  if (!statsWrap) return;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateAll(); observer.disconnect(); }
  }, { threshold: 0.3 });
  observer.observe(statsWrap);
})();

/* ─── Gallery Filter ─────────────────────────────────────────────── */
function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.artwork-card');

  btns.forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      document.querySelectorAll('.artwork-card').forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          const cats    = (card.getAttribute('data-category') || '').split(' ');
          card.classList.toggle('hidden', !cats.includes(filter));
        }
      });
    });
  });
}

window.addEventListener('DOMContentLoaded', initFilter);

/* ─── Active nav link on scroll ─────────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(l => {
          l.classList.toggle('active-link', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ─── Lightbox (real images) ─────────────────────────────────────── */
function openLightbox(src, title, meta) {
  const lb      = document.getElementById('lightbox');
  const img     = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');

  if (!lb || !img) return;

  img.src = src;
  img.alt = title;
  caption.innerHTML = `<strong>${title}</strong><span>${meta}</span>`;

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  // Clear src after transition
  setTimeout(() => {
    const img = document.getElementById('lightboxImg');
    if (img) img.src = '';
  }, 400);
}

function closeLightboxOnBg(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}

// Keyboard close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* ─── Contact Form ───────────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();

  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('submitBtn');
  if (!form || !success || !btn) return;

  // Read values
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  // ── 1. Validate ────────────────────────────────────────────────
  if (!name || !email || !subject || !message) {
    showFormError('Please fill in all fields before sending.'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFormError('Please enter a valid email address.'); return;
  }

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  // ── 2. Save to localStorage (keeps a record of all enquiries) ──
  const inquiry = { name, email, subject, message, date: new Date().toISOString() };
  const all     = JSON.parse(localStorage.getItem('preeti_inquiries') || '[]');
  all.push(inquiry);
  localStorage.setItem('preeti_inquiries', JSON.stringify(all));

  // ── 3. Open email client with pre-filled content ───────────────
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}\n\n---\nSent via Preetilata Portfolio`
  );
  const mailtoLink = `mailto:cutepreeti.lata@gmail.com`
    + `?subject=${encodeURIComponent('Portfolio Inquiry: ' + subject)}`
    + `&body=${body}`;

  // Small delay so the button animation plays, then open mail client
  setTimeout(() => {
    window.location.href = mailtoLink;

    // Show success message
    setTimeout(() => {
      form.classList.add('hidden');
      success.classList.remove('hidden');
      // Update success box with name
      const icon = document.querySelector('.success-icon');
      const para = document.querySelector('#formSuccess p');
      if (icon) icon.textContent = '✉️';
      if (para) para.textContent =
        `Thank you ${name}! Your message has been noted and your email client should have opened. Preetilata will get back to you soon.`;
    }, 600);
  }, 800);
}

function showFormError(msg) {
  // Remove any old error
  document.querySelectorAll('.form-error-msg').forEach(el => el.remove());

  const err = document.createElement('p');
  err.className = 'form-error-msg';
  err.textContent = msg;
  err.style.cssText = `
    color: #e05555;
    font-size: 0.85rem;
    margin-top: -0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(224,85,85,0.1);
    border: 1px solid rgba(224,85,85,0.3);
    border-radius: 6px;
  `;
  const btn = document.getElementById('submitBtn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Send Message';
    btn.parentElement.insertBefore(err, btn);
    setTimeout(() => err.remove(), 4000);
  }
}

/* ─── Parallax hero ──────────────────────────────────────────────── */
(function () {
  const heroBg = document.querySelector('.hero-bg-img');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight * 1.2) {
      heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ─── Subtle card zoom on hover (keyboard accessible) ───────────── */
(function () {
  document.querySelectorAll('.artwork-canvas').forEach(canvas => {
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'button');

    canvas.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        canvas.click();
      }
    });
  });
})();

/* ─── Gold cursor glow ───────────────────────────────────────────── */
(function () {
  const glow = document.createElement('div');
  glow.style.cssText = [
    'position:fixed', 'width:320px', 'height:320px',
    'border-radius:50%', 'pointer-events:none', 'z-index:9998',
    'background:radial-gradient(circle,rgba(201,152,58,0.07) 0%,transparent 70%)',
    'transform:translate(-50%,-50%)',
    'transition:opacity 0.4s ease',
    'mix-blend-mode:screen',
    'opacity:0'
  ].join(';');
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; glow.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

  (function loop() {
    gx += (mx - gx) * 0.07;
    gy += (my - gy) * 0.07;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(loop);
  })();
})();
