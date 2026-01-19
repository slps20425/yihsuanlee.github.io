import{d as u,a as d}from"./firebase-config-ebcnco9P.js";import{d as m,o as p,s as f}from"./index.esm-CzG3mkee.js";let c=60,a=null;const r="wisecat_last_activity";function l(){localStorage.setItem(r,Date.now().toString())}function b(){localStorage.getItem(r)||l();try{const t=m(u,"configuration","settings");p(t,o=>{if(o.exists()){const i=o.data();if(i.session_timeout_minutes){const s=Number(i.session_timeout_minutes);!isNaN(s)&&s>0&&(c=s,console.log(`Session timeout updated to ${c} minutes`))}}})}catch(t){console.error("Error setting up config listener:",t)}let n=null;["mousedown","keydown","scroll","touchstart"].forEach(t=>{document.addEventListener(t,()=>{n||(l(),n=setTimeout(()=>{n=null},5e3))},{passive:!0})}),a&&clearInterval(a),a=setInterval(g,60*1e3)}function g(){if(!d.currentUser)return;const e=Date.now(),t=localStorage.getItem(r),o=t?Number(t):e,i=(e-o)/(1e3*60);i>=c&&(console.log(`Session timed out after ${i.toFixed(1)} minutes of inactivity.`),x(),h("Your session has expired due to inactivity."))}function x(){f(d).then(()=>{console.log("User signed out due to inactivity."),localStorage.removeItem("wisecat_user"),localStorage.removeItem(r),window.location.href="/entry.html"}).catch(n=>{console.error("Sign out error",n)})}function h(n){let e=document.getElementById("centered-toast-container");e||(e=document.createElement("div"),e.id="centered-toast-container",e.style.cssText=`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        `,document.body.appendChild(e));const t=document.createElement("div");t.style.cssText=`
        background: rgba(40, 40, 40, 0.95);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-family: inherit;
        font-size: 16px;
        text-align: center;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    `;const o=document.createElement("div");o.textContent="⏳",o.style.fontSize="32px",o.style.marginBottom="10px";const i=document.createElement("div");i.textContent=n;const s=document.createElement("button");s.textContent="OK",s.style.cssText=`
        margin-top: 15px;
        padding: 8px 20px;
        background: white;
        color: black;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        pointer-events: auto;
    `,s.onclick=()=>{t.style.opacity="0",t.style.transform="scale(0.9)",setTimeout(()=>{e&&e.contains(t)&&e.removeChild(t),e&&e.childNodes.length===0&&document.body.removeChild(e)},300)},t.appendChild(o),t.appendChild(i),t.appendChild(s),e.style.pointerEvents="auto",e.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="scale(1)"})}export{b as s};
