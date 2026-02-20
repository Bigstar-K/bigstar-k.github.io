// Simple lightbox + Wix image auto-import (via r.jina.ai proxy)
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");

function openModal(src, alt=""){
  modalImg.src = src;
  modalImg.alt = alt;
  modal.classList.add("open");
}
function closeModal(){
  modal.classList.remove("open");
  modalImg.src = "";
}
if(modal){
  modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
}
if(modalClose){ modalClose.addEventListener("click", closeModal); }
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }

// Fetch page HTML through r.jina.ai to avoid CORS, extract Wix media URLs
async function loadWixGallery(){
  const holder = document.querySelector("[data-wix-url]");
  if(!holder) return;

  const wixUrl = holder.getAttribute("data-wix-url");
  const status = document.getElementById("galleryStatus");
  const gallery = document.getElementById("gallery");
  const proxyUrl = "https://r.jina.ai/http://"+wixUrl.replace(/^https?:\/\//,"");

  try{
    status.textContent = "Loading images…";
    const res = await fetch(proxyUrl);
    const txt = await res.text();

    // Extract static wix media URLs (jpg/png/jpeg/webp)
    const re = /https?:\/\/static\.wixstatic\.com\/media\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)[^\s"'<>]*/gi;
    let urls = txt.match(re) || [];

    // Some pages include "quality_auto" variants; keep as-is but de-dupe
    urls = uniq(urls);

    // Prefer "fill" or "fit" variants already present. If none found, just render.
    if(!urls.length){
      status.textContent = "No images detected on the source page.";
      return;
    }

    // Render
    status.textContent = `${urls.length} images loaded (hotlinked).`;
    const frag = document.createDocumentFragment();

    urls.forEach((u, i)=>{
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = u;
      img.alt = `Image ${i+1}`;
      img.addEventListener("click", ()=>openModal(u, img.alt));
      const cap = document.createElement("figcaption");
      cap.textContent = `#${i+1}`;
      fig.appendChild(img);
      fig.appendChild(cap);
      frag.appendChild(fig);
    });

    gallery.innerHTML = "";
    gallery.appendChild(frag);

  }catch(err){
    console.error(err);
    status.textContent = "Failed to load images (network/CORS/proxy issue).";
  }
}
loadWixGallery();
