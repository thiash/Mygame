(()=> {
const $=id=>document.getElementById(id);
const state={
 name:'Held',level:1,xp:0,next:100,hp:100,maxHp:100,gold:25,
 x:450,y:290,region:0,points:3,
 stats:{Stärke:5,Ausdauer:5,Geschick:5,Intelligenz:5,Weisheit:5},
 inventory:['Trainingsschwert','Heiltrank','Apfel'],equipment:{Waffe:'Trainingsschwert',Rüstung:'Leinenrüstung',Helm:'—',Stiefel:'Stiefel'},
 enemy:{x:210,y:390,hp:45,maxHp:45,name:'Waldwolf',level:1,alive:true},
 quest:{id:'first',title:'Der erste Weg',text:'Sprich mit der Wächterin auf dem Dorfplatz.',done:false,progress:0},
 npc:{x:650,y:170,name:'Wächterin'}
};
const regions=[
 {name:'Dämmerhain',sub:'Sicheres Startgebiet',ground:'#274b35',accent:'#3f7650',portal:'Ravenfels'},
 {name:'Ravenfels',sub:'Alte Grenzlande',ground:'#4b4030',accent:'#786448',portal:'Steinmark'},
 {name:'Steinmark',sub:'Gefährliche Hochlande',ground:'#3e4549',accent:'#68737a',portal:'Dämmerhain'}
];
let ctx;
function log(t){$('log').textContent=t}
function regionBounds(){return regions[state.region]}
function draw(){
 const r=regionBounds(); ctx.clearRect(0,0,900,560); ctx.fillStyle=r.ground; ctx.fillRect(0,0,900,560);
 ctx.strokeStyle=r.accent; ctx.lineWidth=2;
 for(let x=0;x<900;x+=45){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,560);ctx.stroke()}
 for(let y=0;y<560;y+=45){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke()}
 ctx.lineWidth=1;
 // roads
 ctx.fillStyle='#8b7350';ctx.fillRect(0,255,900,55);ctx.fillRect(425,0,55,560);
 // landmarks
 const landmarks=state.region===0?[['Dorf',80,80],['Tor',790,255],['Brunnen',450,120]]:
 state.region===1?[['Festung',90,80],['Markt',690,120],['Pass',790,450]]:
 [['Bergfried',110,90],['Ruinen',680,120],['Gipfel',770,430]];
 ctx.font='bold 14px system-ui';ctx.textAlign='center';
 landmarks.forEach(([n,x,y])=>{ctx.fillStyle='#161b22';ctx.fillRect(x-42,y-25,84,50);ctx.fillStyle='#e5e7eb';ctx.fillText(n,x,y+5)});
 // portal
 ctx.fillStyle='#b58cff';ctx.beginPath();ctx.arc(820,500,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('Portal',820,540);
 // npc
 if(state.region===0){ctx.fillStyle='#e4b84a';ctx.fillRect(state.npc.x-15,state.npc.y-18,30,36);ctx.fillStyle='#fff';ctx.fillText('NPC',state.npc.x,state.npc.y-28)}
 // enemy
 if(state.enemy.alive && state.region===0){ctx.fillStyle='#a8b0ba';ctx.beginPath();ctx.arc(state.enemy.x,state.enemy.y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f87171';ctx.fillRect(state.enemy.x-18,state.enemy.y-30,36*Math.max(0,state.enemy.hp/state.enemy.maxHp),4)}
 // hero
 ctx.fillStyle='#62a8ff';ctx.beginPath();ctx.arc(state.x,state.y,17,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#fff';ctx.stroke();
 ctx.fillStyle='#22c55e';ctx.fillRect(state.x-16,state.y-31,32*Math.max(0,state.hp/state.maxHp),4);
 ctx.textAlign='left';
}
function render(){
 const r=regionBounds();
 $('hero').textContent=state.name;$('level').textContent='Lv '+state.level;$('xp').textContent='XP '+state.xp+'/'+state.next;$('hp').textContent='HP '+state.hp+'/'+state.maxHp;$('gold').textContent='Gold '+state.gold;$('region').textContent=r.name;
 $('xpbar').style.width=Math.min(100,state.xp/state.next*100)+'%';
 $('locationName').textContent=r.name+' — '+r.sub;$('locationHint').textContent='WASD, Pfeile oder Touch · Portal am Kartenrand';
 $('stats').innerHTML=Object.entries(state.stats).map(([k,v])=>'<div class="stat"><span>'+k+'</span><b>'+v+'</b></div>').join('')+'<div class="stat good"><span>Freie Punkte</span><b>'+state.points+'</b></div>';
 $('levelup').disabled=state.points===0;
 $('inventory-grid').innerHTML=state.inventory.map((item,i)=>'<div title="'+item+'">'+(i===0?'⚔️':i===1?'🧪':i===2?'🍎':'📦')+'<small>'+item+'</small></div>').join('');
 $('equipment-list').innerHTML=Object.entries(state.equipment).map(([k,v])=>'<div class="equip"><span>'+k+'</span><b>'+v+'</b></div>').join('');
 $('spell-list').innerHTML='<div class="card"><b>Keine Zauber gelernt.</b><p>Intelligenz und Weisheit werden für das spätere Magiesystem relevant.</p></div>';
 $('quest-list').innerHTML='<div class="quest '+(state.quest.done?'done':'')+'"><b>'+state.quest.title+'</b><p>'+state.quest.text+'</p><span>'+(state.quest.done?'✓ Abgeschlossen':'○ Offen')+'</span></div>';
 $('world-list').innerHTML=regions.map((x,i)=>'<div class="region '+(i===state.region?'current':'')+'"><b>'+x.name+'</b><small>'+x.sub+'</small></div>').join('');
 draw();
}
function move(dx,dy){
 state.x=Math.max(22,Math.min(878,state.x+dx));state.y=Math.max(22,Math.min(538,state.y+dy));
 if(state.x>790&&state.y>465){changeRegion((state.region+1)%regions.length);return}
 if(state.region===0&&Math.hypot(state.x-state.npc.x,state.y-state.npc.y)<65&&!state.quest.done){state.quest.progress=1;state.quest.done=true;gain(40);log('Quest abgeschlossen! +40 XP. Die Wächterin öffnet dir den Weg.')}
 render();
}
function changeRegion(next){
 state.region=next;state.x=120;state.y=280;
 state.enemy={x:700,y:390,hp:55+next*25,maxHp:55+next*25,name:next===1?'Grenzräuber':'Steinwächter',level:next+1,alive:true};
 log('Du betrittst '+regions[next].name+'.');
 render();
}
function gain(n){
 state.xp+=n;
 while(state.xp>=state.next){state.xp-=state.next;state.level++;state.next=Math.floor(state.next*1.35);state.points+=2;state.maxHp+=15;state.hp=state.maxHp;log('Levelaufstieg! +2 Attributpunkte.')}
}
function distanceEnemy(){return Math.hypot(state.x-state.enemy.x,state.y-state.enemy.y)}
$('create').addEventListener('submit',e=>{e.preventDefault();state.name=$('name').value.trim()||'Held';$('menu').hidden=true;$('game').hidden=false;ctx=$('world').getContext('2d');render();log('Willkommen in Dämmerhain. Sprich mit der Wächterin.');});
window.addEventListener('keydown',e=>{if($('game').hidden||document.activeElement.tagName==='INPUT')return;const d={w:[0,-20],arrowup:[0,-20],s:[0,20],arrowdown:[0,20],a:[-20,0],arrowleft:[-20,0],d:[20,0],arrowright:[20,0]}[e.key.toLowerCase()];if(d){e.preventDefault();move(...d)}});
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const d={up:[0,-20],down:[0,20],left:[-20,0],right:[20,0]}[b.dataset.move];move(...d)}));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-pane').forEach(x=>x.hidden=true);b.classList.add('active');$(b.dataset.tab).hidden=false}));
$('talk').onclick=()=>{if(state.region!==0)return log('Hier gibt es niemanden, mit dem du sprechen kannst.');if(Math.hypot(state.x-state.npc.x,state.y-state.npc.y)<90){state.quest.done=true;gain(40);log('Wächterin: Willkommen, Reisender. Die drei Länder stehen dir offen. Quest abgeschlossen!')}else log('Wächterin: Komm näher, dann können wir reden.')};
$('attack').onclick=()=>{if(!state.enemy.alive)return log('Hier ist kein Gegner mehr.');if(distanceEnemy()>90)return log('Der Gegner ist zu weit entfernt.');if(state.hp<=0)return log('Du bist besiegt. Heile dich zuerst.');const dmg=8+state.stats.Stärke*2;state.enemy.hp=Math.max(0,state.enemy.hp-dmg);state.hp=Math.max(0,state.hp-(4+state.enemy.level));if(state.enemy.hp===0){state.enemy.alive=false;state.gold+=10+state.enemy.level*5;gain(60+state.enemy.level*20);log(state.enemy.name+' besiegt! Beute gefunden.')}else log('Treffer! '+state.enemy.name+' '+state.enemy.hp+'/'+state.enemy.maxHp+' HP.');render()};
$('heal').onclick=()=>{state.hp=state.hp<=0?Math.max(1,Math.floor(state.maxHp/2)):Math.min(state.maxHp,state.hp+25);log('Du regenerierst HP.');render()};
$('levelup').onclick=()=>{if(state.points<=0)return;const keys=Object.keys(state.stats),pick=prompt('Attribut wählen: '+keys.join(', '),'Stärke'),k=keys.find(x=>x.toLowerCase()===String(pick).toLowerCase());if(k){state.stats[k]++;state.points--;if(k==='Ausdauer')state.maxHp+=5;render();log(k+' steigt auf '+state.stats[k]+'.')}};
})();