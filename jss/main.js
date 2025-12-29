/* ==============================
   Singh's Cafe — main.js (v2)
   - Fullscreen hero + overlay header
   - Dropdown menu (desktop) + accordion (mobile)
   ============================== */

const SITE_CONFIG = {
  heroSliderEnabled: true,  // set false for static hero
  parallaxEnabled: true,
  parallaxStrength: 0.22,
  heroAutoplay: true,
  heroIntervalMs: 4500
};

(function(){
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Active nav link
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$("[data-nav]").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href.endsWith(path)) a.setAttribute("aria-current", "page");
  });

  // Theme toggle
  const themeToggle = $("#themeToggle");
  const storedTheme = localStorage.getItem("singhs_theme");
  if (storedTheme === "dark") document.documentElement.classList.add("theme-dark");
  if (storedTheme === "light") document.documentElement.classList.remove("theme-dark");

  themeToggle?.addEventListener("click", () => {
    document.documentElement.classList.toggle("theme-dark");
    localStorage.setItem("singhs_theme", document.documentElement.classList.contains("theme-dark") ? "dark" : "light");
    toast("Theme updated", document.documentElement.classList.contains("theme-dark") ? "Dark mode on." : "Light mode on.");
  });

  // Header transparency on hero pages
  const header = $("#siteHeader");
  const heroHeader = document.body.classList.contains("hero-header");
  if (heroHeader && header){
    header.classList.add("is-transparent");
    const updateHeader = () => {
      const scrolled = (window.scrollY || document.documentElement.scrollTop) > 10;
      header.classList.toggle("is-scrolled", scrolled);
      header.classList.toggle("is-transparent", !scrolled);
    };
    window.addEventListener("scroll", updateHeader, {passive:true});
    updateHeader();
  }

  // Mobile menu overlay
  const menuBtn = $("#menuBtn");
  const menuOverlay = $("#menuOverlay");
  const closeMenuBtn = $("#closeMenuBtn");
  const firstMenuLink = $("#menuOverlay a");
  let lastFocusedBeforeMenu = null;

  function openMenu(){
    if (!menuOverlay) return;
    lastFocusedBeforeMenu = document.activeElement;
    menuOverlay.style.display = "block";
    menuOverlay.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => firstMenuLink?.focus(), 0);
  }
  function closeMenu(){
    if (!menuOverlay) return;
    menuOverlay.setAttribute("aria-hidden", "true");
    menuOverlay.style.display = "none";
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    lastFocusedBeforeMenu?.focus?.();
  }

  menuBtn?.addEventListener("click", openMenu);
  closeMenuBtn?.addEventListener("click", closeMenu);
  menuOverlay?.addEventListener("click", (e) => { if (e.target === menuOverlay) closeMenu(); });

  // Desktop dropdown (button controls aria-expanded for accessibility)
  const ddBtn = $("#specialtiesDropdownBtn");
  const ddMenu = $("#specialtiesDropdownMenu");
  ddBtn?.addEventListener("click", () => {
    const expanded = ddBtn.getAttribute("aria-expanded") === "true";
    ddBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
    ddMenu?.style.setProperty("display", expanded ? "none" : "block");
  });
  document.addEventListener("click", (e) => {
    if (!ddBtn || !ddMenu) return;
    if (ddBtn.contains(e.target) || ddMenu.contains(e.target)) return;
    ddBtn.setAttribute("aria-expanded", "false");
    ddMenu.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      if (menuOverlay && menuOverlay.getAttribute("aria-hidden") === "false") closeMenu();
      closeModal();
      if (ddBtn && ddMenu){
        ddBtn.setAttribute("aria-expanded", "false");
        ddMenu.style.display = "none";
      }
    }
  });

  // Modal
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");
  const modalClose = $("#modalClose");
  let lastFocusedBeforeModal = null;

  function openModal({title, bodyHtml}){
    if (!modal) return;
    lastFocusedBeforeModal = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => modalClose?.focus(), 0);
    document.body.style.overflow = "hidden";
  }
  function closeModal(){
    if (!modal) return;
    if (modal.getAttribute("aria-hidden") === "true") return;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocusedBeforeModal?.focus?.();
  }
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  $$("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-modal");
      if (type === "order"){
        openModal({
          title: "Order Online",
          bodyHtml: `
            <p class="muted">Online ordering is coming soon. For now, call us or visit the café.</p>
            <div class="grid-2" style="margin-top:12px">
              <div class="card pad">
                <div class="kicker">Phone</div>
                <div style="font-weight:800; margin-top:6px">+91 98765 43210</div>
              </div>
              <div class="card pad">
                <div class="kicker">Hours</div>
                <div style="margin-top:6px">Mon–Sun: 8:00 AM – 10:00 PM</div>
              </div>
            </div>`
        });
      } else if (type === "book"){
        openModal({
          title: "Book a Table",
          bodyHtml: `
            <p class="muted">Reservation requests are confirmed by message (demo). Choose a time and party size.</p>
            <form id="bookForm" style="margin-top:12px">
              <div class="grid-2">
                <div class="field">
                  <label for="bDate">Date</label>
                  <input class="input" id="bDate" name="bDate" type="date" required>
                </div>
                <div class="field">
                  <label for="bTime">Time</label>
                  <input class="input" id="bTime" name="bTime" type="time" required>
                </div>
              </div>
              <div class="field">
                <label for="bSize">Party size</label>
                <select class="input" id="bSize" name="bSize" required>
                  <option value="2">2</option><option value="3">3</option><option value="4">4</option>
                  <option value="5">5</option><option value="6">6</option>
                </select>
              </div>
              <button class="btn btn-primary" type="submit">Request Reservation</button>
            </form>
          `
        });
        $("#bookForm")?.addEventListener("submit", (e) => {
          e.preventDefault();
          toast("Request sent", "We’ll confirm your table shortly (demo).");
          closeModal();
        });
      }
    });
  });

  // Toasts
  const toastWrap = $("#toastWrap");
  function toast(title, message){
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`;
    toastWrap.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(6px)";
      t.style.transition = "opacity 250ms ease, transform 250ms ease";
    }, 3200);
    setTimeout(() => t.remove(), 3600);
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  // Back to top
  const backToTop = $("#backToTop");
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (backToTop) backToTop.classList.toggle("is-visible", y > 650);
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
  backToTop?.addEventListener("click", () => window.scrollTo({top:0, behavior: prefersReducedMotion ? "auto" : "smooth"}));

  // Reveal
  const revealEls = $$(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !prefersReducedMotion){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting){
          ent.target.classList.add("is-visible");
          io.unobserve(ent.target);
        }
      });
    }, {threshold: 0.14});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  // Hero slider
  const hero = $("#hero");
  if (hero){
    const slides = $$(".hero-slide", hero);
    const dots = $$(".dot", hero);
    const prevBtn = $("#heroPrev");
    const nextBtn = $("#heroNext");

    if (!SITE_CONFIG.heroSliderEnabled || slides.length <= 1){
      slides.forEach((s, i) => s.classList.toggle("is-active", i === 0));
      $(".hero-controls", hero)?.setAttribute("hidden", "true");
    } else {
      let idx = 0;
      let timer = null;

      const setActive = (n) => {
        idx = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
        dots.forEach((d, i) => d.setAttribute("aria-current", i === idx ? "true" : "false"));
      };

      const next = () => setActive(idx + 1);
      const prev = () => setActive(idx - 1);

      prevBtn?.addEventListener("click", prev);
      nextBtn?.addEventListener("click", next);
      dots.forEach((d, i) => d.addEventListener("click", () => setActive(i)));

      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      });

      const start = () => {
        if (prefersReducedMotion) return;
        if (!SITE_CONFIG.heroAutoplay) return;
        stop();
        timer = setInterval(next, SITE_CONFIG.heroIntervalMs);
      };
      const stop = () => { if (timer) clearInterval(timer); timer = null; };

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      hero.addEventListener("focusin", stop);
      hero.addEventListener("focusout", start);

      setActive(0);
      start();
    }
  }

  // Newsletter
  $("#newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#newsletterEmail")?.value?.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)){
      toast("Check your email", "Please enter a valid email address.");
      return;
    }
    toast("Subscribed!", "Thanks for joining Singh’s Cafe updates.");
    e.target.reset();
  });

  // Menu filtering
  const menuRoot = $("#menuRoot");
  if (menuRoot){
    const tabs = $$(".tab", menuRoot);
    const search = $("#menuSearch");
    const cards = $$(".menu-item", menuRoot);
    const empty = $("#menuEmpty");
    const state = { category: "all", q: "" };

    const apply = () => {
      const q = state.q.toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const cat = (card.getAttribute("data-category") || "").toLowerCase();
        const name = (card.getAttribute("data-name") || "").toLowerCase();
        const show = (state.category === "all" || cat === state.category) && (!q || name.includes(q));
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (empty) empty.style.display = visible ? "none" : "block";
    };

    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.setAttribute("aria-pressed", "false"));
      t.setAttribute("aria-pressed", "true");
      state.category = (t.getAttribute("data-category") || "all").toLowerCase();
      apply();
    }));
    search?.addEventListener("input", () => { state.q = search.value.trim(); apply(); });
    apply();
  }

  // Cart demo
  const cartCountEl = $("#cartCount");
  const cartKey = "singhs_cart_count";
  const initialCount = Number(localStorage.getItem(cartKey) || "0");
  if (cartCountEl) cartCountEl.textContent = String(initialCount);
  $$("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const count = Number(localStorage.getItem(cartKey) || "0") + 1;
      localStorage.setItem(cartKey, String(count));
      if (cartCountEl) cartCountEl.textContent = String(count);
      toast("Added to order", "Item saved locally (demo).");
    });
  });

  // Contact form validation
  const contactForm = $("#contactForm");
  if (contactForm){
    const summary = $("#formSummary");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = [];
      const name = $("#cName");
      const email = $("#cEmail");
      const subject = $("#cSubject");
      const message = $("#cMessage");
      const consent = $("#cConsent");

      clearErrors(contactForm);

      if (!name.value.trim()) errors.push({el:name, msg:"Please enter your name."});
      if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim())) errors.push({el:email, msg:"Please enter a valid email."});
      if (!subject.value) errors.push({el:subject, msg:"Please select a subject."});
      if (!message.value.trim() || message.value.trim().length < 20) errors.push({el:message, msg:"Message should be at least 20 characters."});
      if (!consent.checked) errors.push({el:consent, msg:"Please confirm consent to be contacted."});

      if (errors.length){
        errors.forEach(err => showError(err.el, err.msg));
        if (summary){
          summary.textContent = `Please fix ${errors.length} issue(s) and try again.`;
          summary.classList.remove("sr-only");
        }
        errors[0].el.focus?.();
        return;
      }

      if (summary){
        summary.textContent = "";
        summary.classList.add("sr-only");
      }
      toast("Message sent", "Thanks! We’ll get back to you soon (demo).");
      contactForm.reset();
    });
  }

  function clearErrors(form){
    $$(".error", form).forEach(e => e.remove());
    $$("[aria-invalid='true']", form).forEach(el => el.removeAttribute("aria-invalid"));
  }
  function showError(el, msg){
    el.setAttribute("aria-invalid", "true");
    const p = document.createElement("div");
    p.className = "error";
    p.textContent = msg;
    (el.closest(".field") || el.parentElement).appendChild(p);
  }

})(); // end IIFE


// ===== Reveal animations (IntersectionObserver) =====
(function initRevealAnimations(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  els.forEach(el => io.observe(el));
})();

// ===== Floating quick actions show/hide =====
(function initQuickActions(){
  const qa = document.querySelector('.quick-actions');
  if (!qa) return;

  const toggle = () => {
    if (window.scrollY > 120) qa.classList.add('show');
    else qa.classList.remove('show');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();


// ===== Parallax hero (v5) =====
(function initParallaxHero(){
  if (!SITE_CONFIG.parallaxEnabled) return;
  const hero = document.querySelector('#hero');
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll('.hero-slide img'));
  if (!slides.length) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;
  const apply = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    // amount scrolled past hero top (0..heroHeight)
    const heroH = Math.max(1, hero.offsetHeight);
    const progressed = Math.min(heroH, Math.max(0, -rect.top));
    const y = progressed * (SITE_CONFIG.parallaxStrength ?? 0.22);
    const active = hero.querySelector('.hero-slide.is-active img');
    if (active) {
      active.style.transform = `translate3d(0, ${y}px, 0) scale(1.06)`;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  // reset transforms when slide changes
  const mo = new MutationObserver(() => {
    slides.forEach(img => img.style.transform = 'translate3d(0,0,0) scale(1.06)');
    onScroll();
  });
  mo.observe(hero, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // init
  slides.forEach(img => img.style.transform = 'translate3d(0,0,0) scale(1.06)');
  onScroll();
})();
