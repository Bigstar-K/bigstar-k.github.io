(function(){
  const burger = document.getElementById("burger");
  const mobile = document.getElementById("mobilemenu");
  if(burger && mobile){
    burger.addEventListener("click", ()=>{
      const on = mobile.classList.toggle("on");
      mobile.style.display = on ? "block" : "none";
      burger.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  const path = (location.pathname.endsWith("/") ? location.pathname + "index.html" : location.pathname).toLowerCase();
  document.querySelectorAll("a[data-page]").forEach(a=>{
    const href = (a.getAttribute("href")||"").toLowerCase();
    if(href && path.endsWith(href.replace(/^\//,''))) a.classList.add("active");
  });

  const lb = document.getElementById("lb");
  if(!lb) return;
  const img = lb.querySelector("img");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");
  const btnClose = document.getElementById("lbClose");

  let items = [];
  let idx = 0;

  function collect(){ items = Array.from(document.querySelectorAll("[data-lb]")); }
  function openAt(i){
    if(!items.length) collect();
    if(!items.length) return;
    idx = (i + items.length) % items.length;
    img.src = items[idx].getAttribute("href");
    lb.classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function close(){
    lb.classList.remove("on");
    img.src = "";
    document.body.style.overflow = "";
  }
  function prev(){ openAt(idx - 1); }
  function next(){ openAt(idx + 1); }

  document.addEventListener("click", (e)=>{
    const a = e.target.closest("[data-lb]");
    if(!a) return;
    e.preventDefault();
    collect();
    openAt(items.indexOf(a));
  });

  btnPrev && btnPrev.addEventListener("click", (e)=>{ e.stopPropagation(); prev(); });
  btnNext && btnNext.addEventListener("click", (e)=>{ e.stopPropagation(); next(); });
  btnClose && btnClose.addEventListener("click", (e)=>{ e.stopPropagation(); close(); });

  lb.addEventListener("click", (e)=>{ if(e.target === lb) close(); });
  document.addEventListener("keydown", (e)=>{
    if(!lb.classList.contains("on")) return;
    if(e.key === "Escape") close();
    if(e.key === "ArrowLeft") prev();
    if(e.key === "ArrowRight") next();
  });
})();


document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("pairedGallery");
  if (!gallery) return;

  // 1) 현재 gallery 안의 figure들을 모두 수집
  const figures = Array.from(gallery.querySelectorAll(":scope > figure"));

  // 2) gallery 비우고, row(2칸) 단위로 재구성
  gallery.innerHTML = "";

  let rowNum = 0;
  for (let i = 0; i < figures.length; i += 2) {
    rowNum += 1;
    const setId = `row-${String(rowNum).padStart(2, "0")}`;

    const row = document.createElement("div");
    row.className = "row";

    // 왼쪽 figure
    const left = figures[i];
    applySetAndCaption(left, setId);
    row.appendChild(left);

    // 오른쪽 figure (없으면 empty)
    const right = figures[i + 1];
    if (right) {
      applySetAndCaption(right, setId);
      row.appendChild(right);
    } else {
      const empty = document.createElement("div");
      empty.className = "empty";
      row.appendChild(empty);
    }

    gallery.appendChild(row);
  }

  function applySetAndCaption(figureEl, setId) {
    const a = figureEl.querySelector("a[data-lb]");
    const img = figureEl.querySelector("img");

    // row 세트 지정 (라이트박스에서 row 단위로만 prev/next 하게 쓰임)
    if (a) a.setAttribute("data-set", setId);

    // figcaption 없으면 alt로 생성
    if (img && !figureEl.querySelector("figcaption")) {
      const cap = document.createElement("figcaption");
      cap.textContent = img.getAttribute("alt") || "";
      figureEl.appendChild(cap);
    }
  }
});


<script>
(() => {
  const root = document.getElementById("regardLeSonSlider");
  if (!root) return;

  const viewport = root.querySelector(".slider-viewport");
  const track = root.querySelector(".slider-track");
  const prevBtn = root.querySelector(".slider-btn.prev");
  const nextBtn = root.querySelector(".slider-btn.next");

  const getStep = () => {
    const first = track.querySelector("figure");
    if (!first) return 320;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return first.getBoundingClientRect().width + gap;
  };

  const scrollByStep = (dir) => {
    viewport.scrollBy({ left: dir * getStep(), behavior: "smooth" });
  };

  prevBtn.addEventListener("click", () => scrollByStep(-1));
  nextBtn.addEventListener("click", () => scrollByStep(1));

  // 세로 휠을 가로 이동으로 변환(트랙패드/마우스 모두 편해짐)
  viewport.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      viewport.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // 키보드(← →) 지원
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollByStep(-1);
    if (e.key === "ArrowRight") scrollByStep(1);
  });
})();
</script>

<script src="/assets/js/app.js" defer></script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("regardLeSonSlider");
  if (!root) { console.warn("[slider] root not found"); return; }

  const viewport = root.querySelector(".slider-viewport");
  const track = root.querySelector(".slider-track");
  const prevBtn = root.querySelector(".slider-btn.prev");
  const nextBtn = root.querySelector(".slider-btn.next");

  if (!viewport || !track || !prevBtn || !nextBtn) {
    console.warn("[slider] missing elements", { viewport, track, prevBtn, nextBtn });
    return;
  }

  const getStep = () => {
    const first = track.querySelector("figure");
    if (!first) return 320;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return first.getBoundingClientRect().width + gap;
  };

  const scrollByStep = (dir) => {
    const step = getStep();
    console.log("[slider] step:", step, "scrollLeft(before):", viewport.scrollLeft);
    viewport.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  prevBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); scrollByStep(-1); });
  nextBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); scrollByStep(1); });

  // viewport가 실제로 스크롤 가능해야 함
  // (scrollWidth > clientWidth 가 아니면 "안 움직이는 것처럼" 보임)
  console.log("[slider] scrollWidth/clientWidth:", viewport.scrollWidth, viewport.clientWidth);
});
</script>



<script>
document.addEventListener("DOMContentLoaded", () => {
  // ===== Slider (transform 방식) =====
  const root = document.getElementById("regardLeSonSlider");
  if (!root) return;

  const track = root.querySelector(".slider-track");
  const prev = root.querySelector(".slider-btn.prev");
  const next = root.querySelector(".slider-btn.next");
  const items = Array.from(track.querySelectorAll("figure"));

  let index = 0;

  const stepPx = () => {
    const first = items[0];
    if (!first) return 320;
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return first.getBoundingClientRect().width + gap;
  };

  const maxIndex = () => Math.max(0, items.length - 1);

  const render = () => {
    const x = -(index * stepPx());
    track.style.transform = `translateX(${x}px)`;
    prev.disabled = (index <= 0);
    next.disabled = (index >= maxIndex());
  };

  prev.addEventListener("click", (e) => { e.preventDefault(); index = Math.max(0, index - 1); render(); });
  next.addEventListener("click", (e) => { e.preventDefault(); index = Math.min(maxIndex(), index + 1); render(); });

  window.addEventListener("resize", () => render());
  render();

  // ===== Lightbox (자체 구현: 닫기/ESC/바깥클릭/Prev/Next) =====
  const lb = document.getElementById("lb");
  const lbImg = lb.querySelector(".lb-img");
  const closeBtns = lb.querySelectorAll("[data-lb-close]");
  const lbPrev = lb.querySelector("[data-lb-prev]");
  const lbNext = lb.querySelector("[data-lb-next]");

  const links = Array.from(root.querySelectorAll("a[href]"));
  let lbIndex = 0;

  const openLB = (i) => {
    lbIndex = i;
    lbImg.src = links[lbIndex].href;
    lbImg.alt = links[lbIndex].querySelector("img")?.alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateNav();
  };

  const closeLB = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
    document.body.style.overflow = "";
  };

  const updateNav = () => {
    lbPrev.disabled = (lbIndex <= 0);
    lbNext.disabled = (lbIndex >= links.length - 1);
  };

  const go = (dir) => {
    const ni = lbIndex + dir;
    if (ni < 0 || ni >= links.length) return;
    openLB(ni);
  };

  // 기존 data-lb/외부 라이트박스 충돌 방지: 기본 이동 막고 우리 라이트박스 실행
  links.forEach((a, i) => {
    a.removeAttribute("data-lb"); // 혹시 남아있으면 제거
    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLB(i);
    });
  });

  closeBtns.forEach(btn => btn.addEventListener("click", closeLB));
  lbPrev.addEventListener("click", () => go(-1));
  lbNext.addEventListener("click", () => go(1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });
});
</script>


<script>
document.addEventListener("DOMContentLoaded", () => {
  // 모든 a[data-lb]를 하나의 라이트박스로 연결
  const links = Array.from(document.querySelectorAll('a[data-lb][href]'));
  if (!links.length) return;

  const lb = document.getElementById("lb");
  const img = lb.querySelector(".lb-img");
  const closeEls = lb.querySelectorAll("[data-lb-close]");
  const prevBtn = lb.querySelector("[data-lb-prev]");
  const nextBtn = lb.querySelector("[data-lb-next]");

  let i = 0;

  const setNav = () => {
    prevBtn.disabled = (i <= 0);
    nextBtn.disabled = (i >= links.length - 1);
  };

  const open = (index) => {
    i = index;
    img.src = links[i].href;
    img.alt = links[i].querySelector("img")?.alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setNav();
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    img.src = "";
    document.body.style.overflow = "";
  };

  const go = (dir) => {
    const ni = i + dir;
    if (ni < 0 || ni >= links.length) return;
    open(ni);
  };

  links.forEach((a, idx) => {
    a.addEventListener("click", (e) => {
      e.preventDefault(); // 링크 이동 방지
      open(idx);
    });
  });

  closeEls.forEach(el => el.addEventListener("click", close));
  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });
});
</script>

<button class="menu-toggle" type="button" aria-label="Menu" aria-expanded="false">☰</button>
