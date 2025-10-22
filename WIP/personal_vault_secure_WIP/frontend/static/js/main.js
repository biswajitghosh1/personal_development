document.addEventListener("DOMContentLoaded", function(){
  const hb = document.getElementById("hamburger");
  const nav = document.querySelector("nav ul");
  if(hb && nav){
    hb.addEventListener("click", ()=> nav.classList.toggle("open"));
  }

  // smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", e=>{
      const href = a.getAttribute("href");
      if(!href || href === "#") return;
      e.preventDefault();
      const t = document.querySelector(href);
      if(t) t.scrollIntoView({behavior:"smooth", block:"start"});
      if(nav && nav.classList.contains("open")) nav.classList.remove("open");
    });
  });

  document.addEventListener("click", function(e){
    if(e.target && e.target.id === "addPair"){
      const container = document.getElementById("pairs");
      const div = document.createElement("div");
      div.className = "pair";
      div.innerHTML = '<input name="key[]" placeholder="Field name" required /> <input name="value[]" placeholder="Value" required /> <button type="button" class="remove">−</button>';
      container.appendChild(div);
    }
    if(e.target && e.target.classList && e.target.classList.contains("remove")){
      const parent = e.target.parentElement;
      if(parent) parent.remove();
    }
  });
});
