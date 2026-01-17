import{g as o,h as n}from"./index.esm-dG1ZkEco.js";import{app as i}from"./firebase-config-DWsZ1HWM.js";const c=o(i),l=n(c,"checkMessageSafety");let s=null;const p={async validate(a){if(!a||a.trim().length===0)return{safe:!0};try{const e=(await l({text:a})).data;return e.status==="blocked"?(this.triggerAlarm(),{safe:!1,reason:e.reason}):{safe:!0}}catch(r){return console.error("Scam Check Error:",r),{safe:!0}}},triggerAlarm(){s||(s=new Audio("/assets/alarm.mp3")),s.play().catch(a=>console.warn("Audio play blocked:",a)),this.showToast("🚨 Security Alert: Potential scam detected.","error")},showToast(a,r="success"){let e=document.getElementById("toast-container");e||(e=document.createElement("div"),e.id="toast-container",e.style.cssText="position: fixed; top: 20px; right: 20px; z-index: 9999;",document.body.appendChild(e));const t=document.createElement("div");t.className=`toast toast-${r}`,t.style.cssText=`
            background: ${r==="error"?"#ef4444":"#10b981"};
            color: white;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `,t.innerHTML=r==="error"?`<span>🚫</span> ${a}`:`<span>✅</span> ${a}`,e.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateX(0)"}),setTimeout(()=>{t.style.opacity="0",t.style.transform="translateX(100%)",setTimeout(()=>t.remove(),300)},5e3)}};export{p as S};
