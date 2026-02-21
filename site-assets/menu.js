<script src="/assets/menu.js" defer></script>

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav"); // 네 메뉴 컨테이너 class로 맞춰줘
  if (!btn || !nav) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});
