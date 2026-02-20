(function(){
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const btnClose = document.getElementById('lb-close');
  const btnPrev = document.getElementById('lb-prev');
  const btnNext = document.getElementById('lb-next');

  let items = [];
  let index = 0;

  function openAt(i){
    index = i;
    const src = items[index]?.dataset?.full || items[index]?.querySelector('img')?.src;
    if(!src) return;
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  function move(delta){
    if(!items.length) return;
    index = (index + delta + items.length) % items.length;
    openAt(index);
  }

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-lb-item]');
    if(btn){
      items = Array.from(document.querySelectorAll('[data-lb-item]'));
      const i = items.indexOf(btn);
      openAt(Math.max(0, i));
    }
  });

  btnClose?.addEventListener('click', close);
  btnPrev?.addEventListener('click', ()=>move(-1));
  btnNext?.addEventListener('click', ()=>move(1));
  lb?.addEventListener('click', (e)=>{ if(e.target === lb) close(); });
  document.addEventListener('keydown', (e)=>{
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') move(-1);
    if(e.key === 'ArrowRight') move(1);
  });
})();
