const n="v1.1.7-tooltip-mobile-fix";new Date().toISOString();function t(){const e=document.createElement("div");e.id="app-version-display",e.style.cssText=`
        position: fixed;
        bottom: 5px;
        right: 5px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.3);
        z-index: 9999;
        pointer-events: none;
        font-family: monospace;
    `,e.innerText=`${n} (${new Date().toLocaleTimeString()})`,document.body.appendChild(e)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t();
