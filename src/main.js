import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import confetti from "canvas-confetti";
import { content } from "./content.js";
import photoManifest from "./photos.generated.json";
import { ScrollExperience } from "./scrollExperience.js";
import "./style.css";
import "./sections/loader.js";
import "./sections/hero.js";
import "./sections/isntJustA.js";
import "./sections/specSheet.js";
import "./sections/gallery.js";
import "./sections/flipCards.js";
import "./sections/reviews.js";
import "./sections/chooseYourOwn.js";
import "./sections/pivot.js";
import "./sections/letter.js";
import "./sections/finale.js";
import "./sections/footer.js";
import "./sections/topbar.js";
import "./sections/lockScreen.js";

gsap.registerPlugin(ScrollTrigger);

const app = document.getElementById("app");
let experience = null;
let isReducedMotion = false;
let shouldShowLockScreen = false;

function init() {
  checkReducedMotion();
  determineLockState();
  renderApp();
  injectPhotoManifest();
  initTopbar();
  handleFontsAndImagesLoaded();
}

function injectPhotoManifest() {
  const script = document.createElement("script");
  script.id = "photo-manifest";
  script.type = "application/json";
  script.textContent = JSON.stringify(photoManifest);
  document.body.appendChild(script);
}

function checkReducedMotion() {
  isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  }
}

function determineLockState() {
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "1";
  
  if (isPreview) {
    shouldShowLockScreen = false;
    return;
  }
  
  if (!content.lockUntil) {
    shouldShowLockScreen = false;
    return;
  }
  
  const lockTime = new Date(content.lockUntil).getTime();
  const now = Date.now();
  shouldShowLockScreen = lockTime > now;
}

function renderApp() {
  const name = content.name;
  const birthdayLabel = content.birthdayLabel;
  
  const lockScreenHTML = shouldShowLockScreen ? `
    <div id="lock-screen" class="lock-screen">
      <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <h1 class="lock-title">Opens on ${birthdayLabel}</h1>
      <p class="lock-subtitle">This experience unlocks on the big day. Come back then!</p>
      <div class="lock-countdown" id="lock-countdown">00:00:00</div>
      <p class="preview-notice">Add <code>?preview=1</code> to the URL to bypass</p>
    </div>
  ` : ``;
  
  app.innerHTML = `
    <div class="grain-overlay" aria-hidden="true"></div>
    <div class="progress-bar" aria-hidden="true"></div>
    <header class="topbar" role="banner">
      <span class="topbar-brand">${name}-1</span>
      <div class="topbar-menu">
        <button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="menu-overlay">Menu</button>
      </div>
    </header>
    <nav id="menu-overlay" class="menu-overlay" role="navigation" aria-label="Sections">
      <a href="#hero" class="menu-link" data-section="hero">Hero</a>
      <a href="#isnt-just-a" class="menu-link" data-section="isntJustA">Isn't Just A</a>
      <a href="#spec-sheet" class="menu-link" data-section="specSheet">Spec Sheet</a>
      <a href="#gallery" class="menu-link" data-section="gallery">Gallery</a>
      <a href="#flip-cards" class="menu-link" data-section="flipCards">Memories</a>
      <a href="#reviews" class="menu-link" data-section="reviews">Reviews</a>
      <a href="#choose" class="menu-link" data-section="choose">Choose</a>
      <a href="#pivot" class="menu-link" data-section="pivot">Pivot</a>
      <a href="#letter" class="menu-link" data-section="letter">Letter</a>
      <a href="#finale" class="menu-link" data-section="finale">Finale</a>
    </nav>
    <div id="loader" class="loader" role="status" aria-live="polite" aria-label="Loading">
      <div class="loader-counter" id="loader-counter">000</div>
      <div class="loader-lines" id="loader-lines"></div>
    </div>
    ${lockScreenHTML}
    <div class="lenis-wrapper" id="lenis-wrapper" style="display: none;">
      <main id="main-content">
        <section id="hero" class="section" data-section="hero"></section>
        <section id="isnt-just-a" class="section" data-section="isntJustA"></section>
        <section id="spec-sheet" class="section" data-section="specSheet"></section>
        <section id="gallery" class="section" data-section="gallery"></section>
        <section id="flip-cards" class="section" data-section="flipCards"></section>
        <section id="reviews" class="section" data-section="reviews"></section>
        <section id="choose" class="section" data-section="choose"></section>
        <section id="pivot" class="section" data-section="pivot"></section>
        <section id="letter" class="section" data-section="letter"></section>
        <section id="finale" class="section" data-section="finale"></section>
      </main>
      <footer id="footer" class="footer" hidden></footer>
    </div>
  `;
}

function initTopbar() {
  const menuBtn = document.querySelector(".menu-btn");
  const menuOverlay = document.getElementById("menu-overlay");
  const menuLinks = menuOverlay.querySelectorAll(".menu-link");
  
  let isMenuOpen = false;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    menuOverlay.classList.toggle("is-open", isMenuOpen);
    menuBtn.setAttribute("aria-expanded", isMenuOpen);
    if (isMenuOpen && experience?.lenis) {
      experience.lenis.stop();
    } else if (experience?.lenis) {
      experience.lenis.start();
    }
  }
  
  menuBtn.addEventListener("click", toggleMenu);
  
  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target && experience?.lenis) {
        experience.lenis.scrollTo(target, { offset: 0, immediate: false });
      }
      toggleMenu();
    });
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      toggleMenu();
    }
  });
}

function handleFontsAndImagesLoaded() {
  const loader = document.getElementById("loader");
  const wrapper = document.getElementById("lenis-wrapper");
  const footer = document.getElementById("footer");
  const lockScreen = document.getElementById("lock-screen");
  
  if (shouldShowLockScreen) {
    loader.style.display = "none";
    if (lockScreen) lockScreen.hidden = false;
    startLockCountdown();
    return;
  }
  
  initWebsite();
}

async function initWebsite() {
  const loader = document.getElementById("loader");
  const wrapper = document.getElementById("lenis-wrapper");
  const footer = document.getElementById("footer");
  
  const fontPromises = [
    document.fonts.load('1em "Instrument Serif"'),
    document.fonts.load('1em "Space Grotesk"'),
    document.fonts.load('1em "JetBrains Mono"')
  ];
  
  const criticalImages = [
    "/public/photos/photo-01.webp",
    "/public/photos/photo-02.webp",
    "/public/photos/photo-03.webp",
    "/public/photos/photo-04.webp"
  ].map(src => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = src;
    });
  });
  
  try {
    await Promise.all([...fontPromises, ...criticalImages]);
  } catch {
    // Continue anyway
  }
  
  await animateLoaderOut();
  
  loader.style.display = "none";
  wrapper.style.display = "block";
  footer.hidden = false;
  
  experience = new ScrollExperience({ content });
  experience.init();
  
  await experience.initializeAllSections();
  
  ScrollTrigger.refresh();
  if (experience.lenis && experience.lenis.resize) {
    experience.lenis.resize();
  }
}

function animateLoaderOut() {
  return new Promise(resolve => {
    const counter = document.getElementById("loader-counter");
    const lines = document.getElementById("loader-lines");
    const loader = document.getElementById("loader");
    const counterObj = { value: 0 };
    
    gsap.to(counterObj, {
      value: 100,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        counter.textContent = String(Math.round(counterObj.value)).padStart(3, "0");
      }
    });
    
    gsap.to([counter, lines], {
      opacity: 0,
      y: -20,
      duration: 0.5,
      delay: 0.3,
      ease: "power2.in"
    });
    
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.8,
      delay: 0.5,
      ease: "power3.inOut",
      onComplete: resolve
    });
  });
}

function startLockCountdown() {
  const countdownEl = document.getElementById("lock-countdown");
  const lockTime = new Date(content.lockUntil).getTime();
  let countdownInterval;
  
  function updateCountdown() {
    const now = Date.now();
    const diff = lockTime - now;
    
    if (diff <= 0) {
      if (countdownEl) countdownEl.textContent = "00:00:00";
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      unlockWebsite();
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let text = "";
    if (days > 0) text += `${days}d `;
    text += `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    
    if (countdownEl) countdownEl.textContent = text;
  }
  
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function unlockWebsite() {
  const lockScreen = document.getElementById("lock-screen");
  if (lockScreen) lockScreen.hidden = true;
  shouldShowLockScreen = false;
  initWebsite();
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function indianNumberFormat(num) {
  const str = num.toString();
  const lastThree = str.slice(-3);
  const other = str.slice(0, -3);
  if (!other) return lastThree;
  return other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
}

window.formatNumber = formatNumber;
window.indianNumberFormat = indianNumberFormat;
window.content = content;

document.addEventListener("DOMContentLoaded", init);

export { experience, content, formatNumber, indianNumberFormat };