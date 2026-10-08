const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const nodes=new Map(),tools=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{id,textContent:"",value:0,hidden:false,disabled:false,style:{},dataset:{},attrs:{},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attrs[k]=v},addEventListener(){},append(){},remove(){},focus(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:640,height:470}}});return nodes.get(id)}
const swatches=Array.from({length:4},(_,i)=>Object.assign(node("swatch"+i),{dataset:{color:String(i)}}));
const gradient={addColorStop(){}},context=new Proxy({createRadialGradient:()=>gradient},{get:(t,p)=>t[p]??(()=>{}),set:(t,p,v)=>(t[p]=v,true)});
node("wax-canvas").getContext=()=>context;node("click-button").parentElement=node("stage");
let nextFrame;
const sandbox={document:{getElementById:node,querySelectorAll:()=>swatches,createElement:()=>node("float"),addEventListener(){},modelContext:{registerTool(t){tools.set(t.name,t)}}},window:{addEventListener(){}},performance:{now:()=>0},requestAnimationFrame:f=>nextFrame=f,setTimeout:()=>1,clearTimeout(){},HTMLButtonElement:class{},HTMLAnchorElement:class{},AbortController,console,Math,Promise};
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
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const p=match[1];if(!p.startsWith("data:")&&p!=="./")assert.ok(fs.existsSync("dist/"+p),p)}
assert.equal(tools.size,4);
console.log("PASS: click rewards, upgrade costs, insufficient points, game switching, all wax fragments, colors, held pressure, local assets, tool state and invalid inputs.");

