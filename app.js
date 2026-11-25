{
const KEY='protein-meter-v1';
let armed=false;
const STEPS=[1,5,10,20,25,30];
const SCALE=86; // goal line sits at 86% of the tube; headroom shows going over
const $=id=>document.getElementById(id);
const dkey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
let state={weight:93,aim:'opt',days:{}};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.days){state={...state,...s};delete state.factor;delete state.goal}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
const today=()=>dkey(new Date());
const parse=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
let view=null; // null = today
const cur=()=>view||today();
const entries=()=>state.days[cur()]||(state.days[cur()]=[]);
const MAXBACK=60;
function go(k){view=(!k||k>=today())?null:k;render()}
function shift(n){const d=parse(cur());d.setDate(d.getDate()+n);const lim=new Date();lim.setDate(lim.getDate()-MAXBACK);if(d<parse(dkey(lim)))return;go(dkey(d))}

// g/kg ranges [min, optimal, max]
const RANGE=[1.6,1.9,2.2]; // g/kg: evidence floor, middle, upper
const AIMS={min:{name:'Minimum',sub:'evidence floor',i:0},opt:{name:'Optimal',sub:'middle',i:1},max:{name:'Upper',sub:'max benefit',i:2}};

function calc(){
  const w=+state.weight||0,r=RANGE,f=r[AIMS[state.aim].i];
  return{T:Math.max(1,Math.round(w*f)),lo:Math.round(w*r[0]),hi:Math.round(w*r[2])};
}
const target=()=>calc().T;
const fmt1=n=>(Math.round(n*10)/10).toString();

function seg(el,obj,key){
  el.innerHTML=Object.entries(obj).map(([k,v])=>`<button type="button" role="radio" data-k="${k}" aria-checked="${state[key]===k}">${v.name}<small>${v.sub}</small></button>`).join('');
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state[key]=b.dataset.k;save();el.querySelectorAll('button').forEach(x=>x.setAttribute('aria-checked',x===b));render()});
}
seg($('aim'),AIMS,'aim');$('aim').classList.add('three');
const sum=a=>Math.round(a.reduce((t,e)=>t+e.g,0)*10)/10;
const num=v=>parseFloat(String(v).replace(',','.'));
const fmt=n=>Number.isInteger(n)?n:n.toFixed(1);

$('adds').innerHTML=STEPS.map(n=>`<button class="add" data-g="${n}" aria-label="Add ${n} grams">+${n}<span>g</span></button>`).join('');
$('weight').value=state.weight;

let tt;
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),1600)}

function add(g){
  if(!(g>0))return;
  const before=sum(entries());
  entries().push({g,t:Date.now()});save();render();
  if(before<target()&&sum(entries())>=target())toast('Goal hit. Nice work.');
}

function render(){
  const T=target(),E=sum(entries()),p=E/T;
  const isToday=!view;
  $('date').textContent=isToday?'Today':parse(cur()).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
  $('next').disabled=isToday;$('past').hidden=isToday;
  $('eatLab').textContent=isToday?'Eaten today':'Eaten that day';
  $('eaten').innerHTML=`${fmt(E)}<small>g</small>`;
  $('of').textContent=`of ${T} g`;
  const L=Math.round((T-E)*10)/10;
  $('leftLab').textContent=L>0?'Left to go':'Goal hit';
  $('left').textContent=L>0?`${fmt(L)} g`:(L<0?`+${fmt(-L)} g over`:'Done');
  $('left').classList.toggle('done',L<=0);
  $('liq').style.height=Math.min(100,p*SCALE)+'%';
  $('liq').classList.toggle('full',p>=1);
  $('bar').style.width=Math.min(100,p*100)+'%';
  $('pct').textContent=`${Math.round(p*100)}%`;
  $('ticks').innerHTML=[.25,.5,.75,1].map(f=>`<div class="tick" style="bottom:${f*SCALE}%"><span>${Math.round(T*f)}</span><i></i></div>`).join('');
  $('undo').disabled=!entries().length;$('minus').disabled=E<=0;
  const list=entries().map((e,i)=>({...e,i})).reverse();
  $('log').innerHTML=list.length?list.map(e=>`<li><span><b>+${fmt(e.g)} g</b></span><time>${dkey(new Date(e.t))===cur()?new Date(e.t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'added later'}</time><button class="x" data-i="${e.i}" aria-label="Remove ${fmt(e.g)} grams">×</button></li>`).join(''):'<p class="empty">Nothing yet. Tap a button above after each meal or shake.</p>';
  const days=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-6+k);return d});
  $('week').innerHTML=days.map(d=>{const v=sum(state.days[dkey(d)]||[]);const h=Math.min(100,v/T*100);const k=dkey(d);return `<button type="button" class="day ${k===today()?'today':''} ${k===cur()?'sel':''}" data-d="${k}" aria-label="${d.toLocaleDateString()}: ${fmt(v)} g"><div class="col"><b style="height:${h}%"></b></div><span>${d.toLocaleDateString(undefined,{weekday:'narrow'})}</span></button>`}).join('');
  $('logTitle').textContent=isToday?"Today's log":`Log · ${parse(cur()).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'})}`;
  if(!armed)$('reset').textContent=isToday?'Clear today':'Clear this day';
  const c=calc();
  $('rTarget').textContent=c.T;$('sumVal').textContent=`${c.T} g`;
  $('rRange').textContent=`range ${c.lo}–${c.hi} g`;
}

$('adds').addEventListener('click',e=>{const b=e.target.closest('.add');if(b)add(+b.dataset.g)});
$('customForm').addEventListener('submit',e=>{e.preventDefault();const v=num($('custom').value);if(v>0){add(Math.round(v*10)/10);$('custom').value=''}});
$('undo').addEventListener('click',()=>{const r=entries().pop();if(r){save();render();toast(`Removed ${fmt(r.g)} g`)}});
$('minus').addEventListener('click',()=>{if(sum(entries())>0){entries().push({g:-1,t:Date.now()});save();render()}});
$('log').addEventListener('click',e=>{const b=e.target.closest('.x');if(b){entries().splice(+b.dataset.i,1);save();render()}});
$('weight').addEventListener('input',e=>{const v=num(e.target.value);if(v>0){state.weight=v;save();render()}});
try{if(!localStorage.getItem(KEY+'-seen')){$('settings').open=true;localStorage.setItem(KEY+'-seen','1')}}catch(e){}
$('reset').addEventListener('click',e=>{if(!armed){armed=true;e.target.textContent='Tap again to clear';setTimeout(()=>{armed=false;render()},2500);return}
  state.days[cur()]=[];armed=false;save();render();toast('Day cleared')});
$('prev').addEventListener('click',()=>shift(-1));
$('next').addEventListener('click',()=>shift(1));
$('past').addEventListener('click',()=>go(null));
$('week').addEventListener('click',e=>{const b=e.target.closest('.day');if(b)go(b.dataset.d)});
// prune days older than 60
const cut=new Date();cut.setDate(cut.getDate()-60);for(const k in state.days)if(k<dkey(cut))delete state.days[k];
render();
// roll over at midnight if the page stays open
let last=today();setInterval(()=>{if(today()!==last){last=today();render()}},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
}
