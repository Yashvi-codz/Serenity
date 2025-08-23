(function(){
const modal = document.getElementById('jarModal');
const openBtn = document.getElementById('openJarPopup');
const closeBtn = document.getElementById('closeJarPopup');
const textarea = modal?.querySelector('textarea');
const counter = document.getElementById('jarCount');


if(openBtn && modal && closeBtn){
openBtn.onclick = ()=> modal.style.display = 'block';
closeBtn.onclick = ()=> modal.style.display = 'none';
window.onclick = e=>{ if(e.target == modal) modal.style.display = 'none'; };
}


if(textarea && counter){
const update = ()=> counter.textContent = `${textarea.value.length}/500`;
textarea.addEventListener('input', update);
update();
}
})();