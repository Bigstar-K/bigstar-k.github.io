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
