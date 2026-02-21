<script src="/assets/lightbox.js" defer></script>

(() => {
  const lb = document.getElementById("lb");
  if (!lb) return;

  const img = lb.querySelector(".lb-img");
  const closeEls = lb.querySelectorAll("[data-lb-close]");
  const prevBtn = lb.querySelector("[data-lb-prev]");
  const nextBtn = lb.querySelector("[data-lb-next]");

  let links = [];
  let i = 0;

  const collectLinks = (scope) => {
    // 현재 페이지(또는 특정 컨테이너) 안의 갤러리만 대상으로 하고 싶으면 scope를 바꿔도 됨
    links = Array.from((scope || document).querySelectorAll('a[data-lb][href]'));
  };

  const setNav = () => {
    prevBtn.disabled = (i <= 0);
    nextBtn.disabled = (i >= links.length - 1);
  };

  const open = (index) => {
    if (!links.length) return;
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

  // ✅ 이벤트 위임: SPA/동적 삽입에도 항상 동작
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lb][href]");
    if (!a) return;

    e.preventDefault();
    collectLinks(document); // 또는 특정 컨텐츠 영역만: document.querySelector("#content")
    const idx = links.indexOf(a);
    open(Math.max(0, idx));
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
})();
