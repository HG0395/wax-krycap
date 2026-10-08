"use strict";
const $=id=>document.getElementById(id);
let game="clicker",points=0,powerLevel=0,autoLevel=0,clicks=0,soundOn=false,audio,toastTimer;
const fmt=n=>Math.floor(n).toLocaleString("ko-KR");
const powerCost=()=>Math.round(20*1.55**powerLevel);
const autoCost=()=>Math.round(50*1.6**autoLevel);
function notify(message){$("toast").textContent=message;$("toast").classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("visible"),2200)}
function renderClicker(){
 $("points").textContent=fmt(points);$("power").textContent="+"+fmt(powerLevel+1);
 $("power-level").textContent="Lv. "+powerLevel;$("auto-level").textContent="Lv. "+autoLevel;
 $("power-cost").textContent=fmt(powerCost())+" P";$("auto-cost").textContent=fmt(autoCost())+" P";$("auto-rate").textContent=fmt(autoLevel)+" P / 초";
 $("upgrade-power").disabled=points<powerCost();$("upgrade-auto").disabled=points<autoCost();
 const target=clicks<100?100:clicks<500?500:clicks<1000?1000:Math.ceil((clicks+1)/1000)*1000;
 $("milestone-label").textContent="누적 클릭";$("milestone").textContent=fmt(clicks)+" / "+fmt(target);$("click-progress").max=target;$("click-progress").value=clicks;
}
function sound(kind="click"){
 if(!soundOn)return;
 try{
 audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();
 const t=audio.currentTime,g=audio.createGain();g.connect(audio.destination);
 if(kind==="crack"){
 const length=Math.floor(audio.sampleRate*.115),b=audio.createBuffer(1,length,audio.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(length*.19))*(Math.random()>.87?1:.28);
 const source=audio.createBufferSource(),filter=audio.createBiquadFilter();source.buffer=b;filter.type="highpass";filter.frequency.value=900;source.connect(filter);filter.connect(g);g.gain.setValueAtTime(.35,t);source.start(t);source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect()};
 }else{const o=audio.createOscillator();o.type="sine";o.frequency.setValueAtTime(kind==="upgrade"?660:470,t);o.frequency.exponentialRampToValueAtTime(kind==="upgrade"?990:230,t+.08);g.gain.setValueAtTime(.075,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);o.start(t);o.stop(t+.13);o.onended=()=>{o.disconnect();g.disconnect()}}
 }catch{soundOn=false;$("sound").textContent="♪ 소리 지원 안 됨";$("sound").setAttribute("aria-pressed","false")}
}
$("sound").onclick=()=>{soundOn=!soundOn;$("sound").setAttribute("aria-pressed",String(soundOn));$("sound").textContent=soundOn?"♪ 소리 켜짐":"♪ 소리 꺼짐";sound()};
const vibrationButton=$("vibration");
let vibrationSupported=typeof globalThis.navigator?.vibrate==="function",vibrationOn=false;
function renderVibration(){
 vibrationButton.disabled=!vibrationSupported;
 vibrationButton.setAttribute("aria-pressed",String(vibrationOn));
 vibrationButton.textContent=vibrationSupported?(vibrationOn?"진동 켜짐":"진동 꺼짐"):"진동 미지원";
 vibrationButton.title=vibrationSupported?"클릭과 왁스 파괴 시 진동":"이 브라우저에서는 진동을 지원하지 않아요.";
}
function stopVibration(){
 if(!vibrationSupported)return;
 try{globalThis.navigator.vibrate(0)}catch{}
}
function vibrate(pattern){
 if(!vibrationOn||!vibrationSupported||document.hidden)return;
 try{
 if(globalThis.navigator.vibrate(pattern)===false)throw new Error("Vibration unavailable");
 }catch{
 vibrationOn=false;stopVibration();renderVibration();
 notify("이 환경에서는 진동을 사용할 수 없어요.");
 }
}
vibrationButton.onclick=()=>{
 vibrationOn=!vibrationOn;
 if(vibrationOn)vibrate(15);else stopVibration();
 renderVibration();
};
renderVibration();
window.addEventListener("blur",stopVibration);
window.addEventListener("pagehide",stopVibration);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopVibration()});

function clickPoint(){
 points+=powerLevel+1;clicks++;renderClicker();sound();vibrate(8);
 const b=$("click-button");b.classList.remove("pressed");void b.offsetWidth;b.classList.add("pressed");setTimeout(()=>b.classList.remove("pressed"),100);
 const p=document.createElement("span");p.className="float-point";p.textContent="+"+fmt(powerLevel+1);p.style.left=(45+Math.random()*10)+"%";p.style.top="36%";b.parentElement.append(p);setTimeout(()=>p.remove(),750);
 if([100,500,1000].includes(clicks))notify(fmt(clicks)+"번 클릭! 손끝이 제법인데요?");
 return {points:Math.floor(points),clicks};
}
$("click-button").onclick=clickPoint;
function buy(type){
 if(!["power","auto"].includes(type))throw new Error("지원하지 않는 강화입니다.");
 const cost=type==="power"?powerCost():autoCost();if(points<cost)throw new Error("포인트가 부족해요.");
 points-=cost;if(type==="power")powerLevel++;else autoLevel++;renderClicker();sound("upgrade");notify(type==="power"?"손가락이 더 강해졌어요!":"자동 톡톡이 포인트를 모아요!");
 return {points:Math.floor(points),powerLevel,autoLevel};
}
$("upgrade-power").onclick=()=>buy("power");$("upgrade-auto").onclick=()=>buy("auto");
function selectGame(value){
 if(!["clicker","wax"].includes(value))throw new Error("게임을 선택해주세요.");
 game=value;holding=false;stopVibration();
 $("clicker").hidden=value!=="clicker";$("wax").hidden=value!=="wax";
 $("tab-clicker").setAttribute("aria-pressed",String(value==="clicker"));$("tab-wax").setAttribute("aria-pressed",String(value==="wax"));return {game};
}
$("tab-clicker").onclick=()=>selectGame("clicker");$("tab-wax").onclick=()=>selectGame("wax");
const canvas=$("wax-canvas"),ctx=canvas.getContext("2d"),CX=320,CY=218,R=155;
const palettes=[{name:"딸기 우유",h:337,s:65,l:79,core:"#b9a2ee"},{name:"포도 소다",h:260,s:64,l:79,core:"#f6b2cf"},{name:"민트 크림",h:158,s:43,l:73,core:"#f6d68b"},{name:"망고 푸딩",h:36,s:95,l:72,core:"#b9b2ee"}];
let color=0,tiles=[],pieces=[],holding=false,pointer={x:0,y:0},lastBreak=0,broken=0,squish=0,finished=false;
function trianglePath(p){ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath()}
function newBall(nextColor=color){
 if(!Number.isInteger(nextColor)||nextColor<0||nextColor>=palettes.length)throw new Error("색상 번호는 0~3입니다.");
 stopVibration();color=nextColor;tiles=[];pieces=[];broken=0;finished=false;holding=false;squish=0;
 const n=28,radii=[0,42,83,122,R];
 const point=(ring,i)=>({x:radii[ring]*Math.cos(i*2*Math.PI/n-Math.PI/2),y:radii[ring]*Math.sin(i*2*Math.PI/n-Math.PI/2)});
 const add=p=>tiles.push({p,c:{x:p.reduce((s,v)=>s+v.x,0)/3,y:p.reduce((s,v)=>s+v.y,0)/3},broken:false,tone:Math.random()*4-2});
 for(let i=0;i<n;i++)add([{x:0,y:0},point(1,i),point(1,i+1)]);
 for(let ring=1;ring<4;ring++)for(let i=0;i<n;i++){add([point(ring,i),point(ring+1,i),point(ring+1,i+1)]);add([point(ring,i),point(ring+1,i+1),point(ring,i+1)])}
 $("wax-percent").textContent="0%";$("wax-progress").value=0;$("wax-hint").textContent="꾹 누르고, 쓱 문질러보세요";$("color-name").textContent=palettes[color].name;
 document.querySelectorAll(".swatch").forEach((b,i)=>{b.classList.toggle("selected",i===color);b.setAttribute("aria-pressed",String(i===color))});
 return {color:palettes[color].name,brokenPercent:0};
}
function crack(x,y,keyboard=false){
 if(finished){squish=.11;return {brokenPercent:100}}
 if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error("올바른 좌표가 필요합니다.");
 if(!keyboard&&Math.hypot(x,y)>R+8)return {brokenPercent:Math.round(broken/tiles.length*100)};
 const available=tiles.filter(t=>!t.broken).sort((a,b)=>Math.hypot(a.c.x-x,a.c.y-y)-Math.hypot(b.c.x-x,b.c.y-y));
 const close=available.filter(t=>keyboard||Math.hypot(t.c.x-x,t.c.y-y)<64).slice(0,4);
 if(!close.length)return {brokenPercent:Math.round(broken/tiles.length*100)};
 for(const t of close){t.broken=true;broken++;pieces.push({p:t.p.map(v=>({x:v.x-t.c.x,y:v.y-t.c.y})),x:t.c.x,y:t.c.y,vx:(t.c.x-x)*2+(Math.random()-.5)*150,vy:-100-Math.random()*100,angle:0,spin:(Math.random()-.5)*8,life:2.3,tone:t.tone})}
 sound("crack");vibrate(broken===tiles.length?[25,35,45]:[12,8,18]);squish=.055;
 const percent=Math.round(broken/tiles.length*100);$("wax-percent").textContent=percent+"%";$("wax-progress").value=percent;
 if(broken===tiles.length){finished=true;$("wax-hint").textContent="속까지 말랑! 새 공으로 다시 바삭하게";notify("껍질을 전부 벗겼어요!")}
 else if(percent>65)$("wax-hint").textContent="남은 껍질을 쓱쓱 문질러보세요";
 return {brokenPercent:percent};
}
function pointerPosition(e){const rect=canvas.getBoundingClientRect();return {x:(e.clientX-rect.left)*640/rect.width-CX,y:(e.clientY-rect.top)*470/rect.height-CY}}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.focus({preventScroll:true});pointer=pointerPosition(e);holding=true;canvas.setPointerCapture(e.pointerId);crack(pointer.x,pointer.y);lastBreak=performance.now()});
canvas.addEventListener("pointermove",e=>{pointer=pointerPosition(e)});
canvas.addEventListener("pointerup",()=>{holding=false;stopVibration()});canvas.addEventListener("pointercancel",()=>{holding=false;stopVibration()});canvas.addEventListener("lostpointercapture",()=>{holding=false;stopVibration()});window.addEventListener("blur",()=>{holding=false;stopVibration()});document.addEventListener("visibilitychange",()=>{holding=false;stopVibration()});
$("new-ball").onclick=()=>{newBall();notify("새 왁뿌볼이 준비됐어요!")};
document.querySelectorAll(".swatch").forEach(b=>b.onclick=()=>newBall(Number(b.dataset.color)));
document.addEventListener("keydown",e=>{
 if(e.code!=="Space"||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.target!==canvas&&e.target!==document.body)return;
 if(e.target===document.body&&globalThis.window?.scrollY>0)return;
 e.preventDefault();if(game==="clicker")clickPoint();else{const next=tiles.find(t=>!t.broken);if(next)crack(next.c.x,next.c.y,true);else squish=.1}
});
let last=performance.now(),autoTimer=0;
function frame(now){
 const dt=Math.min((now-last)/1000,.05);last=now;
 if(!document.hidden){autoTimer+=dt;if(autoTimer>=.2){points+=autoLevel*autoTimer;autoTimer=0;renderClicker()}}
 if(game==="wax"){
 if(holding&&now-lastBreak>85){crack(pointer.x,pointer.y);lastBreak=now}
 squish+=((holding?.025:0)-squish)*Math.min(dt*10,1);
 ctx.clearRect(0,0,640,470);
 ctx.beginPath();ctx.ellipse(CX,402,116,13,0,0,Math.PI*2);ctx.fillStyle="rgba(113,69,94,.10)";ctx.fill();
 ctx.save();ctx.translate(CX,CY);ctx.scale(1+squish,1-squish);
 const p=palettes[color],core=ctx.createRadialGradient(-53,-68,12,15,25,R*1.2);core.addColorStop(0,"#fff2fc");core.addColorStop(.25,p.core);core.addColorStop(1,"#7868a4");
 ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fillStyle=core;ctx.fill();
 for(const t of tiles){if(t.broken)continue;trianglePath(t.p);const light=p.l+(-t.c.x*.025-t.c.y*.065)+t.tone;ctx.fillStyle="hsl("+p.h+" "+p.s+"% "+Math.max(42,Math.min(91,light))+"%)";ctx.fill();ctx.strokeStyle="hsla("+p.h+" 40% 48% / .18)";ctx.lineWidth=.65;ctx.stroke()}
 ctx.beginPath();ctx.ellipse(-48,-78,36,15,-.7,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.22)";ctx.fill();ctx.restore();
 pieces=pieces.filter(a=>a.life>0);
 for(const a of pieces){a.life-=dt;a.vy+=650*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;a.angle+=a.spin*dt;if(a.y>190){a.y=190;a.vy=-Math.abs(a.vy)*.24;a.vx*=.9}
 ctx.save();ctx.translate(CX+a.x,CY+a.y);ctx.rotate(a.angle);ctx.globalAlpha=Math.min(1,a.life);trianglePath(a.p);ctx.fillStyle="hsl("+p.h+" "+p.s+"% "+(p.l+a.tone)+"%)";ctx.fill();ctx.strokeStyle="rgba(100,65,85,.18)";ctx.stroke();ctx.restore()}
 }
 requestAnimationFrame(frame);
}
newBall();renderClicker();requestAnimationFrame(frame);
function openGameFromHash(){
 const hash=globalThis.location?.hash;
 if(hash==="#clicker"||hash==="#wax"){selectGame(hash.slice(1));$(hash.slice(1)).scrollIntoView?.({block:"start"});}
}
window.addEventListener("hashchange",openGameFromHash);
openGameFromHash();

const modelContext=document.modelContext;
if(modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}};
 register({name:"read_arcade_state",description:"현재 선택한 게임과 이번 세션의 포인트, 강화, 왁스 진행률을 읽습니다.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({game,points:Math.floor(points),clicks,powerLevel,autoLevel,waxColor:palettes[color].name,brokenPercent:Math.round(broken/tiles.length*100)})});
 register({name:"select_arcade_game",description:"클리커 또는 왁뿌볼 화면을 엽니다. 게임 진행 상태는 유지됩니다.",inputSchema:{type:"object",properties:{game:{type:"string",enum:["clicker","wax"]}},required:["game"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>selectGame(input.game)});
 register({name:"buy_clicker_upgrade",description:"포인트를 사용해 클릭당 획득량 또는 자동 획득량을 강화합니다.",inputSchema:{type:"object",properties:{type:{type:"string",enum:["power","auto"]}},required:["type"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>buy(input.type)});
 register({name:"create_new_wax_ball",description:"진행 중인 왁뿌볼을 초기화하고 지정 색상의 새 공을 만듭니다.",inputSchema:{type:"object",properties:{color:{type:"integer",minimum:0,maximum:3}},required:["color"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>newBall(input.color)});
 window.addEventListener("pagehide",()=>lifecycle.abort(),{once:true});
}
