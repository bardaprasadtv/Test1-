(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ----- header solid on scroll
  const header = $("#siteHeader");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // ----- mobile menu overlay
  const menuBtn = $("#menuBtn");
  const closeMenuBtn = $("#closeMenuBtn");
  const menuOverlay = $("#menuOverlay");

  const openMenu = () => {
    if (!menuOverlay) return;
    menuOverlay.classList.add("open");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  };

  menuBtn?.addEventListener("click", openMenu);
  closeMenuBtn?.addEventListener("click", closeMenu);
  menuOverlay?.addEventListener("click", (e) => {
    if (e.target === menuOverlay) closeMenu();
  });

  // ----- specialties dropdown (desktop)
  const ddBtn = $("#specialtiesDropdownBtn");
  const ddMenu = $("#specialtiesDropdownMenu");
  const ddWrap = ddBtn?.closest(".nav-item");

  const closeDropdown = () => {
    ddWrap?.classList.remove("open");
    ddBtn?.setAttribute("aria-expanded", "false");
  };

  ddBtn?.addEventListener("click", () => {
    const isOpen = ddWrap?.classList.toggle("open");
    ddBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!ddWrap) return;
    if (!ddWrap.contains(e.target)) closeDropdown();
  });

  // ----- reveal on scroll
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ----- hero slider
  const slides = $$(".hero-slide");
  const dots = $$(".dot");
  const prev = $("#heroPrev");
  const next = $("#heroNext");
  let idx = 0;
  let timer = null;

  const setSlide = (i) => {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;

    slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
    dots.forEach((d, k) => {
      d.classList.toggle("is-active", k === idx);
      d.setAttribute("aria-current", k === idx ? "true" : "false");
    });
  };

  const startAuto = () => {
    if (timer) clearInterval(timer);
    if (slides.length <= 1) return;
    timer = setInterval(() => setSlide(idx + 1), 4500);
  };

  dots.forEach((d, k) => d.addEventListener("click", () => { setSlide(k); startAuto(); }));
  prev?.addEventListener("click", () => { setSlide(idx - 1); startAuto(); });
  next?.addEventListener("click", () => { setSlide(idx + 1); startAuto(); });

  // simple parallax feel (move active image slightly)
  const parallax = () => {
    const activeImg = $(".hero-slide.is-active img");
    if (!activeImg) return;
    const y = Math.min(24, window.scrollY * 0.06);
    activeImg.style.transform = `scale(1.06) translateY(${y}px)`;
  };
  window.addEventListener("scroll", parallax, { passive: true });
  setSlide(0);
  startAuto();
  parallax();

  // ----- modal
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const modalTitle = $("#modalTitle");
  const modalClose = $("#modalClose");

  const openModal = (title, html) => {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  };

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  $$("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-modal");
      if (type === "order") {
        openModal("Order Online", `<p class="muted">Demo only. Add your real ordering link later.</p>`);
      } else {
        openModal("Book a Table", `<p class="muted">Demo only. Add booking form / WhatsApp / phone link.</p>`);
      }
    });
  });

  // ----- back to top
  const backToTop = $("#backToTop");
  const onScrollTop = () => {
    backToTop?.classList.toggle("show", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScrollTop, { passive: true });
  onScrollTop();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
