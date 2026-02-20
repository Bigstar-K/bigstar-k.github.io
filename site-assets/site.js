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
