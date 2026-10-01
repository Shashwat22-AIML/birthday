const LOADER_LINES = [
  (name) => `Loading ${name}-1...`,
  () => "Compiling memories...",
  () => "Calibrating smile...",
  () => "Almost there..."
];

export function initLoader(sectionEl, content, { gsap }) {
  const linesContainer = document.getElementById("loader-lines");
  const counter = document.getElementById("loader-counter");
  const name = content.name;

  LOADER_LINES.forEach((lineFn, i) => {
    const line = document.createElement("div");
    line.className = "loader-line";
    line.textContent = lineFn(name);
    line.style.animationDelay = `${0.3 + i * 0.4}s`;
    linesContainer.appendChild(line);
  });

  gsap.to(counter, {
    innerText: 100,
    duration: 2.5,
    snap: { innerText: 1 },
    ease: "power2.out",
    onUpdate: function() {
      counter.textContent = String(Math.round(this.targets()[0].innerText)).padStart(3, "0");
    }
  });

  LOADER_LINES.forEach((_, i) => {
    gsap.to(linesContainer.children[i], {
      opacity: 1,
      x: 0,
      duration: 0.4,
      delay: 0.3 + i * 0.4,
      ease: "power2.out"
    });
  });
}

window.initLoader = initLoader;