import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export class ScrollExperience {
  constructor(options = {}) {
    this.content = options.content;
    this.lenis = null;
    this.isReducedMotion = false;
    this.scrollProgress = 0;
    this.sections = [];
    this.photoElements = new Map();
    this.sharedTimelines = new Map();
    this.confettiInstance = null;
    this.isInitialized = false;
  }

  init() {
    this.checkReducedMotion();
    this.createLenis();
    this.setupScrollTrigger();
    this.createGlobalElements();
    this.registerSections();
    this.createGlobalAnimations();
    this.handleResize();
    this.handleOrientationChange();
    this.isInitialized = true;
  }

  checkReducedMotion() {
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.isReducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  createLenis() {
    const wrapper = document.getElementById("lenis-wrapper");
    
    if (this.isReducedMotion) {
      this.lenis = this.createFallbackLenis();
      return;
    }

    this.lenis = new Lenis({
      wrapper,
      content: wrapper,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    this.lenis.on("scroll", ScrollTrigger.update);
  }

  createFallbackLenis() {
    return {
      scroll: 0,
      limit: document.documentElement.scrollHeight - window.innerHeight,
      on: () => {},
      off: () => {},
      scrollTo: (target, options) => {
        target.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
      },
      stop: () => {},
      start: () => {},
      destroy: () => {},
      resize: () => { this.limit = document.documentElement.scrollHeight - window.innerHeight; }
    };
  }

  setupScrollTrigger() {
    const wrapper = document.getElementById("lenis-wrapper");
    ScrollTrigger.defaults({
      scroller: this.isReducedMotion ? window : wrapper,
      markers: false
    });
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
  }

  createGlobalElements() {
    this.createConfettiCanvas();
    this.createGrainOverlay();
    this.createProgressBar();
  }

  createConfettiCanvas() {
    const canvas = document.createElement("canvas");
    canvas.id = "global-confetti-canvas";
    canvas.className = "global-confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10000;
      display: none;
    `;
    document.body.appendChild(canvas);
    this.confettiCanvas = canvas;
  }

  createGrainOverlay() {
    const grain = document.querySelector(".grain-overlay");
    if (grain && this.isReducedMotion) {
      grain.style.opacity = "0.02";
    }
  }

  createProgressBar() {
    this.progressBar = document.querySelector(".progress-bar");
    if (this.lenis && this.progressBar) {
      this.lenis.on("scroll", () => {
        const scrollPercent = this.lenis.scroll / (this.lenis.limit || 1);
        this.progressBar.style.transform = `scaleX(${scrollPercent})`;
      });
    }
  }

  registerSections() {
    const sectionConfigs = [
      { id: "hero", init: "initHero", height: "200vh" },
      { id: "isnt-just-a", init: "initIsntJustA", height: "150vh" },
      { id: "spec-sheet", init: "initSpecSheet", height: "auto" },
      { id: "gallery", init: "initGallery", height: "400vh" },
      { id: "flip-cards", init: "initFlipCards", height: "auto" },
      { id: "reviews", init: "initReviews", height: "auto" },
      { id: "choose", init: "initChoose", height: "auto" },
      { id: "pivot", init: "initPivot", height: "200vh" },
      { id: "letter", init: "initLetter", height: "200vh" },
      { id: "finale", init: "initFinale", height: "150vh" }
    ];

    this.sections = sectionConfigs.map(config => ({
      ...config,
      element: document.getElementById(config.id),
      initialized: false
    }));
  }

  createGlobalAnimations() {
    this.createBackgroundTransition();
    this.createContinuousPhotoMovement();
  }

  createBackgroundTransition() {
    this.bgTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          this.scrollProgress = self.progress;
          this.updateGlobalBackground(self.progress);
        }
      }
    });
  }

  updateGlobalBackground(progress) {
    const cream = { r: 244, g: 238, b: 230 };
    const night = { r: 20, g: 16, b: 14 };
    
    let bgProgress = 0;
    if (progress > 0.5) {
      bgProgress = gsap.utils.clamp(0, 1, (progress - 0.5) * 2);
    }

    const r = Math.round(cream.r + (night.r - cream.r) * bgProgress);
    const g = Math.round(cream.g + (night.g - cream.g) * bgProgress);
    const b = Math.round(cream.b + (night.b - cream.b) * bgProgress);
    
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    
    const grain = document.querySelector(".grain-overlay");
    if (grain) {
      grain.style.opacity = 0.05 + bgProgress * 0.1;
    }
  }

  createContinuousPhotoMovement() {
    this.photoParallaxTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });
  }

  registerPhotoElement(id, element, config = {}) {
    this.photoElements.set(id, { element, ...config });
  }

  unregisterPhotoElement(id) {
    this.photoElements.delete(id);
  }

  initConfetti() {
    if (this.confettiInstance) return;
    this.confettiInstance = confetti.create(this.confettiCanvas, {
      resize: true,
      useWorker: true
    });
  }

  triggerFullViewportCelebration() {
    this.initConfetti();
    this.confettiCanvas.style.display = "block";
    
    const colors = ["#F2A7B8", "#C9955C", "#F4EEE6", "#FFD700", "#FF8C00", "#FF6B6B", "#4ECDC4"];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const bursts = [
      { x: 0.15, y: 0.85, count: 120, spread: 110, drift: -0.6 },
      { x: 0.85, y: 0.85, count: 120, spread: 110, drift: 0.6 },
      { x: 0.5, y: 0.5, count: 200, spread: 160, drift: 0 },
      { x: 0.3, y: 0.3, count: 80, spread: 100, drift: -0.3 },
      { x: 0.7, y: 0.3, count: 80, spread: 100, drift: 0.3 },
      { x: 0.5, y: 0.8, count: 150, spread: 140, drift: 0 }
    ];

    bursts.forEach((burst, i) => {
      setTimeout(() => {
        this.confettiInstance({
          particleCount: burst.count,
          spread: burst.spread,
          origin: { x: burst.x, y: burst.y },
          colors,
          gravity: 0.7,
          scalar: 1.3,
          drift: burst.drift
        });
      }, i * 150);
    });

    setTimeout(() => {
      this.confettiCanvas.style.display = "none";
    }, 4000);
  }

  handleResize() {
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.lenis && this.lenis.resize) {
          this.lenis.resize();
        }
        ScrollTrigger.refresh();
      }, 250);
    }, { passive: true });
  }

  handleOrientationChange() {
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        if (this.lenis && this.lenis.resize) {
          this.lenis.resize();
        }
        ScrollTrigger.refresh();
      }, 500);
    });
  }

  async initializeSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section || section.initialized) return;
    
    const initFn = window[section.init];
    if (initFn && section.element) {
      await initFn(section.element, this.content, { 
        gsap, 
        ScrollTrigger, 
        lenis: this.lenis, 
        confetti: this.confettiInstance,
        experience: this
      });
      section.initialized = true;
    }
  }

  async initializeAllSections() {
    for (const section of this.sections) {
      await this.initializeSection(section.id);
    }
  }

  refresh() {
    ScrollTrigger.refresh();
    if (this.lenis && this.lenis.resize) {
      this.lenis.resize();
    }
  }
}

window.ScrollExperience = ScrollExperience;