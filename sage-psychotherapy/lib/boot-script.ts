/**
 * Runs before first paint, so calm mode and the evening palette are already
 * settled when the page draws. Kept deliberately tiny and wrapped in try/catch —
 * a browser with storage blocked must still render the day palette cleanly.
 *
 * With JavaScript off nothing sets data-mode at all, and globals.css falls back
 * to prefers-color-scheme on its own.
 */
export const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement;
d.setAttribute('data-js','on');
if(localStorage.getItem('sage:calm')==='on'){d.setAttribute('data-calm','on');}
var p=localStorage.getItem('sage:mode');
if(p!=='day'&&p!=='evening'){p='auto';}
d.setAttribute('data-mode-pref',p);
var m=p;
if(p==='auto'){
var h=new Date().getHours();
var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
m=(dark||h>=20||h<7)?'evening':'day';
}
d.setAttribute('data-mode',m);
}catch(e){}})();`;
