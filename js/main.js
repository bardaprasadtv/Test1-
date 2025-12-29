const siteConfig = {
  heroSliderEnabled: true,
  heroIntervalMs: 5200,

  parallaxEnabled: true,
  parallaxStrength: 0.22, // increase for stronger effect
};

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  initHeaderSolidOnScroll();
  initDropdown();
  initMobileNav();
  initReveal();
  initHeroSlider();
  initParallaxHero();
});

function initHeaderSolidOnScroll(){
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const apply = () => {
    if (window.scrollY > 10) header.classList.add("is-solid");
    else header.classList.remove("is-solid");
  };
  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

function initDropdown(){
  const ddBtn = document.querySelector("[data-dd]");
  const ddWrap = ddBtn?.closest(".nav-dd");
  if (!ddBtn || !ddWrap) return;

  const close = () => ddWrap.classList.remove("open");

  ddBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    ddWrap.classList.toggle("open");
  });

  document.addEventListener("click", close);
  window.addEventListener("scroll", close, { passive: true });
}

function initMobileNav(){
  const openBtn = document.querySelector("[data-mobile-open]");
  const mobile = document.querySelector("[data-mobile]");
  if (!openBtn || !mobile) return;

  openBtn.addEventListener("click", () => {
    mobile.classList.toggle("open");
  });

  // close on link click
  mobile.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobile.classList.remove("open"));
  });
}

function initReveal(){
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  if (prefersReduced){
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

  els.forEach(el => io.observe(el));
}

function initHeroSlider(){
  const hero = document.querySelector("[data-hero]");
  const slidesWrap = document.querySelector("[data-hero-slides]");
  const dotsWrap = document.querySelector("[data-hero-dots]");
  if (!hero || !slidesWrap || !dotsWrap) return;

  const slides = Array.from(slidesWrap.querySelectorAll(".hero-slide"));
  if (!slides.length) return;

  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });

  const dots = Array.from(dotsWrap.querySelectorAll("button"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");

  let idx = slides.findIndex(s => s.classList.contains("is-active"));
  if (idx < 0) idx = 0;

  function paint(){
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  function goTo(i){
    idx = (i + slides.length) % slides.length;
    paint();
  }

  prev?.addEventListener("click", () => goTo(idx - 1));
  next?.addEventListener("click", () => goTo(idx + 1));
  paint();

  if (!siteConfig.heroSliderEnabled) return;

  let t = setInterval(() => goTo(idx + 1), siteConfig.heroIntervalMs);

  // Pause while user interacts
  hero.addEventListener("pointerdown", () => clearInterval(t));
  hero.addEventListener("pointerup", () => {
    clearInterval(t);
    t = setInterval(() => goTo(idx + 1), siteConfig.heroIntervalMs);
  });
}

function initParallaxHero(){
  if (!siteConfig.parallaxEnabled) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return;

  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  let raf = null;

  const update = () => {
    raf = null;

    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

    const activeImg = hero.querySelector(".hero-slide.is-active .hero-bg");
    if (!activeImg) return;

    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    const offset = (progress - 0.5) * 2 * (siteConfig.parallaxStrength * 120);

    activeImg.style.transform = `translateY(${offset}px) scale(1.05)`;
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}
