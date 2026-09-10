const GAMES={
 p5r:{cls:'theme-p5r',accent:'#e50920',name:'PERSONA 5 ROYAL',short:'5 ROYAL',mark:'P5R',eyebrow:'PHANTOM THIEVES DATABASE',title:'PERSONA 5<br><span>ROYAL</span>',desc:'A complete guide interface for Personas, Confidants, Palaces and the calendar.',social:'CONFIDANTS',socialIntro:'Track Confidants, abilities and the best opportunities to strengthen each relationship.',dungeon:'PALACES',dungeonEyebrow:'DUNGEONS',dungeonIntro:'Explore Palace routes, targets, Shadows and important encounters.',calendarIntro:'Plan your days and keep track of important activities and deadlines.',quick:[['01','PERSONAS','Persona database and fusion information.','personas'],['02','CONFIDANTS','Ranks, abilities and relationship guidance.','social'],['03','PALACES','Routes, targets and Shadow encounters.','dungeons']],personas:[['01','PERSONA DATABASE','Browse Personas by Arcana, level and role.'],['02','FUSION','Organize fusion targets and useful combinations.'],['03','ARCANA','Review Arcana relationships and Persona bonuses.']],socials:[['01','CONFIDANTS','Rank progression, abilities and availability.'],['02','RANK UPS','Track requirements for each rank.'],['03','SPECIAL LINKS','Important relationship events and bonuses.']],dungeons:[['01',"KAMOSHIDA'S PALACE",'Castle of Lust — route and Shadow encounters.'],['02',"MADARAME'S PALACE",'Museum of Vanity — route and Shadow encounters.'],['03',"KANESHIRO'S PALACE",'Bank of Gluttony — route and Shadow encounters.']],calendar:[['05/01','School and daily activities'],['05/02','Confidant opportunities'],['05/03','Palace preparation'],['05/04','Free time / planning']]},
 p4g:{cls:'theme-p4g',accent:'#f2cf00',name:'PERSONA 4 GOLDEN',short:'4 GOLDEN',mark:'P4G',eyebrow:'INVESTIGATION TEAM DATABASE',title:'PERSONA 4<br><span>GOLDEN</span>',desc:'A transformed guide interface for Personas, Social Links, dungeons and daily planning.',social:'SOCIAL LINKS',socialIntro:'Manage Social Links, ranks, abilities and the people you meet in Inaba.',dungeon:'DUNGEONS',dungeonEyebrow:'MIDNIGHT CHANNEL',dungeonIntro:'Review dungeon progression, enemies, bosses and important exploration information.',calendarIntro:'Organize school days, Social Links, work and other activities.',quick:[['01','PERSONAS','Persona database and fusion information.','personas'],['02','SOCIAL LINKS','Ranks, abilities and relationship guidance.','social'],['03','DUNGEONS','Explore each TV World dungeon.','dungeons']],personas:[['01','PERSONA DATABASE','Browse Personas by Arcana, level and role.'],['02','FUSION','Organize fusion targets and useful combinations.'],['03','ARCANA','Review Social Link Arcana bonuses.']],socials:[['01','SOCIAL LINKS','Rank progression and availability.'],['02','RANK UPS','Track dialogue and rank requirements.'],['03','INABA','Important characters and relationship events.']],dungeons:[['01',"YUKIKO'S CASTLE",'A mysterious castle inside the TV World.'],['02','STEAMY BATHHOUSE','A dangerous dungeon with escalating encounters.'],['03','VOID QUEST','An unusual dungeon inspired by a retro game world.']],calendar:[['04/17','School and town activities'],['04/18','Social Link opportunities'],['04/19','Study / part-time work'],['04/20','Dungeon preparation']]},
 p3r:{cls:'theme-p3r',accent:'#2d9cff',name:'PERSONA 3 RELOAD',short:'3 RELOAD',mark:'P3R',eyebrow:'SEES DATABASE',title:'PERSONA 3<br><span>RELOAD</span>',desc:'A transformed guide interface for Personas, Social Links, Tartarus and the calendar.',social:'SOCIAL LINKS',socialIntro:'Track Social Links, progression and the opportunities available throughout the year.',dungeon:'TARTARUS',dungeonEyebrow:'DARK HOUR',dungeonIntro:'Prepare for Tartarus exploration, Shadows, floors, Guardians and important encounters.',calendarIntro:'Plan school, Social Links, activities and Tartarus runs around the monthly schedule.',quick:[['01','PERSONAS','Persona database and fusion information.','personas'],['02','SOCIAL LINKS','Social Link progression and abilities.','social'],['03','TARTARUS','Floors, Shadows and exploration.','dungeons']],personas:[['01','PERSONA DATABASE','Browse Personas by Arcana, level and role.'],['02','FUSION','Organize fusion targets and useful combinations.'],['03','ARCANA','Review Arcana bonuses.']],socials:[['01','SOCIAL LINKS','Rank progression, availability and events.'],['02','RANK UPS','Track requirements for each rank.'],['03','SEES','Important teammates and social activities.']],dungeons:[['01','TARTARUS','The primary dungeon during the Dark Hour.'],['02','SHADOWS','Encounter information and exploration notes.'],['03','GUARDIANS','Important floor encounters and preparation.']],calendar:[['04/09','School begins'],['04/10','Social Link opportunities'],['04/11','Free time / activities'],['04/12','Tartarus preparation']]}
};

let currentGame=localStorage.getItem('personaGuideGame')||'p5r';
let transitionTimer=null;
let pageTimer=null;
const $=id=>document.getElementById(id);

function cards(items,container,clickable=false){
  container.innerHTML=items.map(x=>`<article class="${clickable?'quick-card':'content-card'}" ${clickable?`data-page="${x[3]}"`:''}><span class="card-label">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p>${clickable?'<span class="card-link">OPEN →</span>':''}</article>`).join('');
}

function personaCards(){
  if(!window.P5R_PERSONAS)return GAMES.p5r.personas;
  return P5R_PERSONAS.map((persona,index)=>[
    String(index+1).padStart(2,'0'),
    persona.name.toUpperCase(),
    `${persona.arcana} Arcana · Lv. ${persona.level} · ${persona.role}`
  ]);
}

function arcanaCards(){
  if(!window.P5R_ARCANAS)return GAMES.p5r.personas;
  return P5R_ARCANAS.slice(0,6).map((arcana,index)=>[
    String(index+1).padStart(2,'0'),
    arcana.name.toUpperCase(),
    `Arcana ${arcana.number} · ${arcana.description}`
  ]);
}

function render(key){
  const g=GAMES[key];
  $('logoSub').textContent=g.short;
  $('heroEyebrow').textContent=g.eyebrow;
  $('heroTitle').innerHTML=g.title;
  $('heroDescription').textContent=g.desc;
  $('heroMark').textContent=g.mark;
  $('socialHeading').textContent=g.social;
  $('socialIntro').textContent=g.socialIntro;
  $('dungeonHeading').textContent=g.dungeon;
  $('dungeonEyebrow').textContent=g.dungeonEyebrow;
  $('dungeonIntro').textContent=g.dungeonIntro;
  $('calendarIntro').textContent=g.calendarIntro;
  $('footerGame').textContent=g.name;
  $('dungeonNav').textContent=g.dungeon;
  $('personasIntro').textContent=key==='p5r'?'Browse the growing Persona database by Arcana, level, role and combat profile.':'Browse Personas by Arcana, level and role.';

  cards(g.quick,$('quickGrid'),true);
  cards(key==='p5r'?personaCards():g.personas,$('personasGrid'));
  cards(key==='p5r'?arcanaCards():g.socials,$('socialGrid'));
  cards(g.dungeons,$('dungeonGrid'));
  $('calendarList').innerHTML=g.calendar.map(x=>`<div class="calendar-row"><div class="calendar-date">${x[0]}</div><div>${x[1]}</div></div>`).join('');
  document.querySelectorAll('.game-switch').forEach(b=>b.classList.toggle('active',b.dataset.game===key));
  bindPageLinks();
}

function bindPageLinks(){
  document.querySelectorAll('[data-page]').forEach(b=>{
    b.onclick=event=>{event.preventDefault();showPage(b.dataset.page,event);};
  });
}

function pageAccent(){return getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e50920';}

function cinematicFlash(target){
  const layer=$('transitionLayer');
  if(!layer)return;
  layer.style.setProperty('--page-accent',pageAccent());
  layer.style.setProperty('--page-x',`${target?.clientX||window.innerWidth/2}px`);
  layer.style.setProperty('--page-y',`${target?.clientY||window.innerHeight/2}px`);
  layer.classList.remove('page-transition');
  void layer.offsetWidth;
  layer.classList.add('page-transition');
  setTimeout(()=>layer.classList.remove('page-transition'),720);
}

function animatePage(){
  if(pageTimer)clearTimeout(pageTimer);
  const active=document.querySelector('.page.active');
  if(!active)return;
  active.classList.remove('cinematic-enter');
  void active.offsetWidth;
  active.classList.add('cinematic-enter');
  if(window.gsap){
    gsap.fromTo(active.querySelectorAll('.page-heading > *, .hero-copy > *, .hero-mark, .quick-card, .content-card, .calendar-panel, .calendar-row'),{opacity:0,y:28,rotate:-1.5,filter:'blur(5px)'},{opacity:1,y:0,rotate:0,filter:'blur(0px)',duration:.65,stagger:.055,ease:'power3.out',clearProps:'all'});
  }
}

function showPage(page,event){
  const target=document.querySelector(`.nav-button[data-page="${page}"]`);
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('active',s.dataset.pageSection===page));
  document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  cinematicFlash(event);
  animatePage();
  window.scrollTo({top:0,behavior:'smooth'});
  if(target&&window.gsap)gsap.fromTo(target,{scale:1.18},{scale:1,duration:.45,ease:'back.out(2)',clearProps:'transform'});
}

function clearTransition(){
  if(transitionTimer){clearTimeout(transitionTimer);transitionTimer=null;}
  const layer=$('transitionLayer');
  layer.className='transition-layer';
}

function applyGame(key){
  document.body.classList.remove('theme-p5r','theme-p4g','theme-p3r');
  document.body.classList.add(GAMES[key].cls);
  currentGame=key;
  localStorage.setItem('personaGuideGame',key);
  render(key);
  document.documentElement.style.setProperty('color-scheme','dark');
}

function setPersona(key,animate=true){
  if(!GAMES[key]||key===currentGame)return;
  const layer=$('transitionLayer');
  clearTransition();
  if(!animate){applyGame(key);return;}
  const button=document.querySelector(`.game-switch[data-game="${key}"]`);
  const rect=button?button.getBoundingClientRect():null;
  const x=rect?rect.left+rect.width/2:window.innerWidth/2;
  const y=rect?rect.top+rect.height/2:window.innerHeight/2;
  layer.style.setProperty('--infection',GAMES[key].accent);
  layer.style.setProperty('--infectionGlow',GAMES[key].accent+'99');
  layer.style.setProperty('--infection-x',`${x}px`);
  layer.style.setProperty('--infection-y',`${y}px`);
  layer.className=`transition-layer infection-${key}`;
  void layer.offsetWidth;
  layer.classList.add('active');
  transitionTimer=setTimeout(()=>applyGame(key),470);
  setTimeout(()=>layer.className='transition-layer',1120);
}

document.querySelectorAll('.game-switch').forEach(b=>b.addEventListener('click',()=>setPersona(b.dataset.game)));
document.querySelectorAll('.nav-button').forEach(b=>b.addEventListener('click',e=>showPage(b.dataset.page,e)));
document.addEventListener('keydown',e=>{if(e.key==='1')setPersona('p5r');if(e.key==='2')setPersona('p4g');if(e.key==='3')setPersona('p3r');if(e.key==='Escape')showPage('home',e);});
document.querySelector('.logo')?.addEventListener('click',e=>{e.preventDefault();showPage('home',e);});

applyGame(currentGame);
showPage('home');
