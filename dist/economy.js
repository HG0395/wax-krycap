"use strict";
(function(root){
 function compareUpgrades(input){
  const {clicksPerSecond,powerLevel,autoLevel,balance}=input;
  if(!Number.isFinite(clicksPerSecond)||clicksPerSecond<0||clicksPerSecond>20||
     !Number.isInteger(powerLevel)||powerLevel<0||powerLevel>50||
     !Number.isInteger(autoLevel)||autoLevel<0||autoLevel>50||
     !Number.isFinite(balance)||balance<0||balance>1e15)throw new Error("클릭 속도는 0~20, 레벨은 0~50의 정수, 포인트는 0~1,000조 범위로 입력하세요.");
  const rate=clicksPerSecond*(powerLevel+1)+autoLevel;
  const plan=(cost,extraRate)=>({cost,extraRate,waitSeconds:balance>=cost?0:rate>0?(cost-balance)/rate:Infinity,recoverySeconds:extraRate>0?cost/extraRate:Infinity});
  return {rate,power:plan(Math.round(20*1.55**powerLevel),clicksPerSecond),auto:plan(Math.round(50*1.6**autoLevel),1)};
 }
 const api={compareUpgrades};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.TokEconomy=api;
})(globalThis);
