const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const nodes=new Map(),tools=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{id,textContent:"",value:0,hidden:false,disabled:false,style:{},dataset:{},attrs:{},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attrs[k]=v},addEventListener(){},append(){},remove(){},focus(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:640,height:470}}});return nodes.get(id)}
const swatches=Array.from({length:4},(_,i)=>Object.assign(node("swatch"+i),{dataset:{color:String(i)}}));
const gradient={addColorStop(){}},context=new Proxy({createRadialGradient:()=>gradient},{get:(t,p)=>t[p]??(()=>{}),set:(t,p,v)=>(t[p]=v,true)});
node("wax-canvas").getContext=()=>context;node("click-button").parentElement=node("stage");
const documentEvents=new Map(),windowEvents=new Map();let nextFrame;
const sandbox={location:{hash:""},document:{body:node("body"),getElementById:node,querySelectorAll:()=>swatches,createElement:()=>node("float"),addEventListener(type,fn){documentEvents.set(type,fn)},modelContext:{registerTool(t){tools.set(t.name,t)}}},window:{scrollY:0,addEventListener(type,fn){windowEvents.set(type,fn)}},performance:{now:()=>0},requestAnimationFrame:f=>nextFrame=f,setTimeout:()=>1,clearTimeout(){},HTMLButtonElement:class{},HTMLAnchorElement:class{},AbortController,console,Math,Promise};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync("dist/app.js","utf8"),sandbox);
const read=()=>tools.get("read_arcade_state").execute();
assert.equal(read().points,0);assert.equal(node("upgrade-power").disabled,true);
for(let i=0;i<20;i++)node("click-button").onclick();
assert.equal(read().points,20);assert.equal(node("upgrade-power").disabled,false);
tools.get("buy_clicker_upgrade").execute({type:"power"});assert.equal(read().points,0);node("click-button").onclick();assert.equal(read().points,2);
assert.throws(()=>tools.get("buy_clicker_upgrade").execute({type:"auto"}));assert.equal(read().points,2);
tools.get("select_arcade_game").execute({game:"wax"});assert.equal(node("wax").hidden,false);assert.equal(node("clicker").hidden,true);
assert.throws(()=>tools.get("select_arcade_game").execute({game:"invalid"}));assert.equal(read().game,"wax");
vm.runInContext("for(let i=0;i<60;i++){const t=tiles.find(t=>!t.broken);if(t)crack(t.c.x,t.c.y,true)}",sandbox);assert.equal(read().brokenPercent,100);assert.equal(node("wax-progress").value,100);
tools.get("create_new_wax_ball").execute({color:2});assert.equal(read().brokenPercent,0);assert.equal(read().waxColor,"민트 크림");
assert.throws(()=>tools.get("create_new_wax_ball").execute({color:9}));assert.equal(read().waxColor,"민트 크림");
vm.runInContext("holding=true;pointer={x:0,y:0}",sandbox);
for(let i=1;i<=400;i++)nextFrame(i*16);
assert.ok(vm.runInContext("squish",sandbox)<.08);assert.ok(read().brokenPercent>0);
const html=fs.readFileSync("dist/index.html","utf8");
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const p=match[1];if(!/^(data:|https?:|#)/.test(p)&&p!=="./")assert.ok(fs.existsSync("dist/"+p),p)}
assert.equal(tools.size,4);
console.log("PASS: click rewards, upgrade costs, insufficient points, game switching, all wax fragments, colors, held pressure, local assets, tool state and invalid inputs.");


assert.equal(node("vibration").disabled,true);
const vibrations=[];
const hapticSandbox={...sandbox,navigator:{vibrate:pattern=>{vibrations.push(pattern);return true}}};
vm.createContext(hapticSandbox);vm.runInContext(fs.readFileSync("dist/app.js","utf8"),hapticSandbox);
vibrations.length=0;assert.equal(node("vibration").disabled,false);
assert.equal(node("vibration").attrs["aria-pressed"],"false");
node("click-button").onclick();assert.equal(vibrations.length,0);
node("vibration").onclick();assert.equal(vibrations.at(-1),15);
node("click-button").onclick();assert.equal(vibrations.at(-1),8);
tools.get("select_arcade_game").execute({game:"wax"});assert.equal(vibrations.at(-1),0);
vm.runInContext("crack(0,0)",hapticSandbox);assert.equal(JSON.stringify(vibrations.at(-1)),"[12,8,18]");
let count=vibrations.length;vm.runInContext("crack(500,500)",hapticSandbox);assert.equal(vibrations.length,count);
hapticSandbox.document.hidden=true;vm.runInContext("crack(0,0)",hapticSandbox);assert.equal(vibrations.length,count);hapticSandbox.document.hidden=false;
vm.runInContext("for(let i=0;i<60;i++){const t=tiles.find(t=>!t.broken);if(t)crack(t.c.x,t.c.y,true)}",hapticSandbox);
assert.equal(JSON.stringify(vibrations.at(-1)),"[25,35,45]");
node("vibration").onclick();assert.equal(vibrations.at(-1),0);
count=vibrations.length;node("click-button").onclick();assert.equal(vibrations.length,count);
hapticSandbox.navigator.vibrate=()=>false;node("vibration").onclick();assert.equal(node("vibration").attrs["aria-pressed"],"false");
hapticSandbox.navigator.vibrate=()=>{throw new Error("blocked")};node("vibration").onclick();assert.equal(node("vibration").attrs["aria-pressed"],"false");
node("click-button").onclick();
console.log("PASS: unsupported API, opt-in, click pulse, wax pulse, completion pulse, outside ball, hidden document, stop on game switch, disable, denied and throwing API.");

const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(m[1]),"Internal link: "+m[1]);
for(const id of ["guide","faq","about","main-content","games"])assert.ok(ids.has(id));
for(let i=0;i<4;i++){
 assert.ok(html.includes("<td>"+Math.round(20*1.55**i)+" P</td>"));
 assert.ok(html.includes("<td>"+Math.round(50*1.6**i)+" P</td>"));
}
assert.equal(JSON.parse(fs.readFileSync("wrangler.jsonc","utf8")).pages_build_output_dir,"./dist");
assert.ok(html.includes('aria-label="누적 클릭 목표 진행률"'));
assert.ok(html.includes('aria-label="벗겨낸 왁스 비율"'));
const key=documentEvents.get("keydown"),event=target=>({code:"Space",target,preventDefault(){this.prevented=true}});
let before=read().points;
const guideEvent=event(node("guide"));key(guideEvent);assert.equal(read().points,before);assert.equal(guideEvent.prevented,undefined);
hapticSandbox.window.scrollY=800;const scrolled=event(node("body"));key(scrolled);assert.equal(read().points,before);assert.equal(scrolled.prevented,undefined);
tools.get("select_arcade_game").execute({game:"clicker"});hapticSandbox.window.scrollY=0;
before=read().points;const background=event(node("body"));key(background);assert.equal(read().points,before+1);assert.equal(background.prevented,true);
const buttonEvent=event(node("sound"));before=read().points;key(buttonEvent);assert.equal(read().points,before);assert.equal(buttonEvent.prevented,undefined);
tools.get("create_new_wax_ball").execute({color:0});tools.get("select_arcade_game").execute({game:"wax"});key(event(node("wax-canvas")));assert.ok(read().brokenPercent>0);
hapticSandbox.location.hash="#clicker";windowEvents.get("hashchange")();assert.equal(read().game,"clicker");
hapticSandbox.location.hash="#guide";windowEvents.get("hashchange")();assert.equal(read().game,"clicker");
console.log("PASS: guide links, cost examples, deployment directory, progress labels, keyboard scope, reading scroll and game deep links.");
