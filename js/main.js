(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Header solid on scroll ----------
  const header = document.getElementById("siteHeader");
  const setHeader = () => {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 10);
  };
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  // ---------- Desktop dropdown (Specialties) ----------
  const ddBtn = document.getElementById("specialtiesDropdownBtn");
  const ddMenu = document.getElementById("specialtiesDropdownMenu");
  const navItem = ddBtn ? ddBtn.closest(".nav-item") : null;

  function closeDropdown() {
    if (!navItem || !ddBtn) return;
    navItem.classList.remove("open");
    ddBtn.setAttribute("aria-expanded", "false");
  }

  if (ddBtn && ddMenu && navItem) {
    ddBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navItem.classList.toggle("open");
      ddBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", closeDropdown);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }

  // ---------- Mobile menu overlay ----------
  const menuBtn = document.getElementById("menuBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenuBtn = document.getElementById("closeMenuBtn");

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add("open");
    menuOverlay.setAttribute("aria-hidden", "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (menuBtn) menuBtn.addEventListener("click", openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (menuOverlay) {
    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) closeMenu();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ---------- Reveal on scroll ----------
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            ent.target.classList.add("is-visible");
            io.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Back to top ----------
  const backToTop = document.getElementById("backToTop");
  const setBtt = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("show", window.scrollY > 700);
  };
  setBtt();
  window.addEventListener("scroll", setBtt, { passive: true });
  if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Hero slider + parallax ----------
  const hero = document.getElementById("hero");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".dot"));
    const prev = document.getElementById("heroPrev");
    const next = document.getElementById("heroNext");

    if (slides.length) {
      let index = slides.findIndex((s) => s.classList.contains("is-active"));
      if (index < 0) index = 0;

      const AUTOPLAY = true;        // change to false if you want
      const AUTOPLAY_MS = 5500;

      function setActive(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle("is-active", k === index));
        dots.forEach((d, k) => {
          d.classList.toggle("is-active", k === index);
          d.setAttribute("aria-current", k === index ? "true" : "false");
        });
      }

      dots.forEach((d, k) => d.addEventListener("click", () => setActive(k)));
      if (prev) prev.addEventListener("click", () => setActive(index - 1));
      if (next) next.addEventListener("click", () => setActive(index + 1));

      // autoplay
      let t = null;
      if (AUTOPLAY && !prefersReduced) {
        t = setInterval(() => setActive(index + 1), AUTOPLAY_MS);
        hero.addEventListener("mouseenter", () => t && clearInterval(t));
        hero.addEventListener("mouseleave", () => (t = setInterval(() => setActive(index + 1), AUTOPLAY_MS)));
      }

      // parallax: move active slide image slightly on scroll
      const parallax = () => {
        if (prefersReduced) return;
        const active = slides[index];
        const img = active ? active.querySelector("img") : null;
        if (!img) return;
        const y = window.scrollY * 0.18; // strength
        img.style.transform = `translate3d(0, ${y}px, 0) scale(1.06)`;
      };
      parallax();
      window.addEventListener("scroll", parallax, { passive: true });
    }
  }

  // ---------- Active nav highlight ----------
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("is-active");
  });
})();
