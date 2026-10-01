export function initTopbar(sectionEl, content, { gsap, ScrollTrigger, lenis }) {
  // Topbar is rendered in main.js, this is just for any scroll-based behavior
  const topbar = document.querySelector(".topbar");
  let lastScroll = 0;
  
  if (isReducedMotion()) return;
  
  if (lenis) {
    lenis.on("scroll", ({ scroll, direction }) => {
      if (scroll > lastScroll && scroll > 200) {
        gsap.to(topbar, { y: -100, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to(topbar, { y: 0, duration: 0.3, ease: "power2.out" });
      }
      lastScroll = scroll;
    });
  }
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduced-motion");
}

window.initTopbar = initTopbar;