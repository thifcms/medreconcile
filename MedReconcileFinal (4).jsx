// ─── MedReconcile FINAL — Design Mesclado (Glassmorphism + Motion + Hero) ────
import React, { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

const firebaseConfig = {
  apiKey:"AIzaSyCogtfOJ-_qlXCGGEqvZ9sRFlfWm_20yao",authDomain:"spherical-leaf-vr5vm.firebaseapp.com",
  projectId:"spherical-leaf-vr5vm",storageBucket:"spherical-leaf-vr5vm.firebasestorage.app",
  messagingSenderId:"572028997371",appId:"1:572028997371:web:86d2fc27b2f6d4e529ea5e"
};
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app,"ai-studio-07b01720-0a41-4e0a-89f7-93e327ec5916");
const provider=new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
let _token=localStorage.getItem("med_drive_token");
const setToken=t=>{_token=t;t?localStorage.setItem("med_drive_token",t):localStorage.removeItem("med_drive_token");};
const getToken=()=>_token;

const AI_URL="https://audit-ai-572028997371.us-east1.run.app/api";
const AI_KEY="dk_admin_4c42b5f89cfa4988b81f07d624c16fd8";
const CONVENIOS=["Unimed","Amil","Bradesco Saúde","SulAmérica","Porto Seguro","Prevent Senior","NotreDame Intermédica","Hapvida","Particular","Outro"];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const fmtBRL=v=>v==null?"—":Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtDt=d=>d?new Date(d).toLocaleDateString("pt-BR"):"—";
const today=()=>new Date().toISOString().split("T")[0];

const G=()=>(
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#e8ecee;--glass:rgba(255,255,255,0.68);--border:rgba(255,255,255,0.75);
      --text:#1a1c1e;--text2:#3b3e42;--text3:#8a9099;
      --lead:#4b5259;--lead2:#272d32;--lead3:#1e2528;
      --green:#2ec866;--green2:#1fa050;--greenglow:#39e874;
      --red:#d94040;--orange:#d97a00;
      --shadow:0 4px 24px rgba(0,0,0,0.08);--shadow2:0 8px 40px rgba(0,0,0,0.14);
      --blur:blur(24px) saturate(180%);
    }
    body{font-family:'Nunito',-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased;}
    .mesh-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:
        radial-gradient(ellipse 80% 60% at 8% 12%,rgba(46,200,102,0.055) 0%,transparent 65%),
        radial-gradient(ellipse 50% 55% at 92% 18%,rgba(46,200,102,0.028) 0%,transparent 60%),
        radial-gradient(ellipse 60% 50% at 78% 88%,rgba(75,82,89,0.04) 0%,transparent 60%),
        linear-gradient(160deg,#eaedeb 0%,#eceef0 50%,#e9ecee 100%);}
    .mesh-bg::before{content:'';position:absolute;inset:0;
      background:radial-gradient(circle 280px at 72% 28%,rgba(46,200,102,0.035) 0%,transparent 70%),
        radial-gradient(circle 200px at 18% 62%,rgba(46,200,102,0.025) 0%,transparent 70%);}
    .glass{
      background:linear-gradient(145deg,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.58) 100%);
      backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);
      border:1px solid rgba(255,255,255,0.75);border-radius:24px;
      box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,0.80);}
    .btn-p{
      display:inline-flex;align-items:center;justify-content:center;gap:8px;
      padding:14px 22px;border-radius:18px;border:none;cursor:pointer;
      font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;color:#fff;
      background:linear-gradient(135deg,#35d46e 0%,#22a852 60%,#1a8f45 100%);
      box-shadow:0 6px 24px rgba(46,200,102,0.40),0 1px 0 rgba(255,255,255,0.25) inset;
      position:relative;overflow:hidden;transition:all 0.2s;}
    .btn-p::before{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent);
      transform:skewX(-20deg);transition:left 0.5s ease;}
    .btn-p:hover::before{left:130%;}
    .btn-p:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(46,200,102,0.52);}
    .btn-p:active{transform:scale(0.97);}
    .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    .btn-g{
      display:inline-flex;align-items:center;justify-content:center;gap:8px;
      padding:13px 20px;border-radius:16px;cursor:pointer;font-family:'Nunito',sans-serif;
      font-size:14px;font-weight:700;color:var(--lead);
      background:linear-gradient(135deg,rgba(255,255,255,0.58),rgba(255,255,255,0.38));
      border:1px solid rgba(255,255,255,0.70);
      box-shadow:0 2px 10px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.75);
      transition:all 0.18s;}
    .btn-g:hover{background:rgba(255,255,255,0.82);transform:translateY(-1px);}
    .btn-g:active{transform:scale(0.97);}
    .btn-d{display:inline-flex;align-items:center;justify-content:center;gap:6px;
      padding:9px 14px;border-radius:12px;cursor:pointer;font-family:'Nunito',sans-serif;
      font-size:13px;font-weight:700;color:var(--red);
      background:rgba(217,64,64,0.07);border:1px solid rgba(217,64,64,0.13);transition:all 0.18s;}
    .btn-d:hover{background:rgba(217,64,64,0.13);}
    .input{
      width:100%;padding:13px 16px;border-radius:14px;
      border:1.5px solid rgba(255,255,255,0.68);
      background:linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,255,255,0.65));
      box-shadow:inset 0 1px 4px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.80);
      font-family:'Nunito',sans-serif;font-size:15px;color:var(--text);outline:none;transition:all 0.18s;}
    .input:focus{border-color:rgba(46,200,102,0.55);background:rgba(255,255,255,0.94);
      box-shadow:0 0 0 4px rgba(46,200,102,0.12),inset 0 1px 4px rgba(0,0,0,0.04);}
    .input::placeholder{color:var(--text3);}
    select.input{cursor:pointer;}
    .lbl{font-size:11px;font-weight:800;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
    .badge-g{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;
      font-size:12px;font-weight:700;background:rgba(46,200,102,0.12);color:#1a7a3c;border:1px solid rgba(46,200,102,0.18);}
    .badge-o{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;
      font-size:12px;font-weight:700;background:rgba(217,122,0,0.10);color:#8a4d00;}
    .badge-l{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;
      font-size:12px;font-weight:700;background:rgba(75,82,89,0.10);color:var(--lead);}
    .nav{
      position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      display:flex;gap:2px;padding:6px;
      background:linear-gradient(160deg,#323a40 0%,#222930 60%,var(--lead3) 100%);
      border-radius:24px;border:1px solid rgba(255,255,255,0.08);
      box-shadow:0 10px 40px rgba(0,0,0,0.30),0 1px 0 rgba(255,255,255,0.06) inset;z-index:50;}
    .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;
      padding:10px 18px;border-radius:18px;border:none;cursor:pointer;
      background:transparent;color:rgba(255,255,255,0.35);
      font-size:10px;font-weight:800;font-family:'Nunito',sans-serif;
      transition:all 0.22s cubic-bezier(0.34,1.4,0.64,1);min-width:68px;}
    .nav-btn svg{width:20px;height:20px;}
    .nav-btn.active{
      background:linear-gradient(135deg,#35d46e 0%,#22a852 70%,#1a8f45 100%);
      color:#fff;box-shadow:0 4px 16px rgba(46,200,102,0.52),0 1px 0 rgba(255,255,255,0.22) inset;}
    .nav-btn:hover:not(.active){color:rgba(255,255,255,0.72);}
    .pin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:220px;margin:0 auto;}
    .pin-key{aspect-ratio:1;border-radius:50%;border:none;cursor:pointer;
      background:linear-gradient(145deg,rgba(255,255,255,0.90),rgba(255,255,255,0.68));
      color:var(--text);font-size:20px;font-weight:700;font-family:'Nunito',sans-serif;
      box-shadow:0 3px 12px rgba(0,0,0,0.09),inset 0 1px 0 rgba(255,255,255,0.92);
      transition:all 0.14s cubic-bezier(0.34,1.56,0.64,1);}
    .pin-key:active{transform:scale(0.88);background:linear-gradient(135deg,#35d46e,#22a852);color:#fff;box-shadow:0 4px 18px rgba(46,200,102,0.42);}
    .toast-wrap{position:fixed;top:20px;right:20px;z-index:300;display:flex;flex-direction:column;gap:8px;}
    .toast{padding:13px 18px;border-radius:14px;font-size:14px;font-weight:700;max-width:300px;
      background:linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.80));
      backdrop-filter:var(--blur);border:1px solid rgba(255,255,255,0.78);
      box-shadow:0 8px 32px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;}
    .toast-success{border-left:4px solid var(--green);}
    .toast-error{border-left:4px solid var(--red);}
    .toast-info{border-left:4px solid var(--lead);}
    .upload-area{border:2px dashed rgba(75,82,89,0.18);border-radius:16px;padding:36px 20px;
      text-align:center;cursor:pointer;transition:all 0.20s;color:var(--text3);
      background:linear-gradient(145deg,rgba(255,255,255,0.40),rgba(255,255,255,0.20));}
    .upload-area:hover{border-color:rgba(46,200,102,0.50);
      background:linear-gradient(145deg,rgba(46,200,102,0.06),rgba(46,200,102,0.02));
      color:var(--green2);box-shadow:0 0 0 4px rgba(46,200,102,0.08);}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimLoad{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}
    .anim-up{animation:fadeUp 0.32s cubic-bezier(0.34,1.4,0.64,1) both;}
    .spin{animation:spin 0.8s linear infinite;}
    .stagger>*{animation:fadeUp 0.32s cubic-bezier(0.34,1.4,0.64,1) both;}
    .stagger>*:nth-child(1){animation-delay:.04s}.stagger>*:nth-child(2){animation-delay:.09s}
    .stagger>*:nth-child(3){animation-delay:.14s}.stagger>*:nth-child(4){animation-delay:.19s}
    ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.10);border-radius:4px;}
    input,select,button{font-family:'Nunito',sans-serif;}
  `}</style>
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
async function toBase64(file){return new Promise((r,j)=>{const x=new FileReader();x.onload=()=>r(x.result.split(",")[1]);x.onerror=j;x.readAsDataURL(file);});}
async function compressImg(file){return new Promise((r,j)=>{const rd=new FileReader();rd.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");let w=img.width,h=img.height,m=2500;if(w>m||h>m){if(w>h){h=Math.round(h*m/w);w=m;}else{w=Math.round(w*m/h);h=m;}}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);r(c.toDataURL("image/jpeg",1.0));};img.onerror=j;img.src=e.target.result;};rd.onerror=j;rd.readAsDataURL(file);});}
async function callAI(file){let b,m;try{if(file.type.startsWith("image/")&&file.size>1.5*1024*1024){const c=await compressImg(file);b=c.split(",")[1];m="image/jpeg";}else{b=await toBase64(file);m=file.type||"image/jpeg";}}catch{b=await toBase64(file);m=file.type||"image/jpeg";}
  const r=await fetch(`${AI_URL}/gemini/extract`,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":AI_KEY},body:JSON.stringify({fileType:m,base64Data:b,prompt:"Extraia os dados desta etiqueta hospitalar: nome_paciente, numero_atendimento, convenio, data_nascimento, data_atendimento.",schema:{type:"object",properties:{nome_paciente:{type:"string"},numero_atendimento:{type:"string"},convenio:{type:"string"},data_nascimento:{type:"string"},data_atendimento:{type:"string"}}}})});
  if(!r.ok)throw new Error("Erro ao processar");return await r.json();}
const saveProfile=(u,p)=>setDoc(doc(db,"users",u,"data","profile"),p);
const saveHosp=(u,h)=>setDoc(doc(db,"users",u,"hospitals",h.id),h);
const delHosp=(u,id)=>deleteDoc(doc(db,"users",u,"hospitals",id));
const saveAtt=(u,a)=>setDoc(doc(db,"users",u,"attendances",a.id),a);
const delAtt=(u,id)=>deleteDoc(doc(db,"users",u,"attendances",id));

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcoHome=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoList=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoAudit=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const IcoCfg=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const TABS=[{id:"unidades",label:"Início",Ico:IcoHome},{id:"atendimentos",label:"Pacientes",Ico:IcoList},{id:"auditagem",label:"Conciliar",Ico:IcoAudit},{id:"config",label:"Ajustes",Ico:IcoCfg}];
const TITLES={unidades:"Unidades Médicas",atendimentos:"Atendimentos",auditagem:"Conciliação",config:"Perfil & Ajustes"};

// ─── SPLASH 3D ────────────────────────────────────────────────────────────────
function Splash({isLoading,onComplete}){
  const[exiting,setExiting]=useState(false);const[v,setV]=useState(true);
  useEffect(()=>{
    if(!isLoading){const t=setTimeout(()=>{setExiting(true);setTimeout(()=>{setV(false);onComplete();},550);},900);return()=>clearTimeout(t);}
  },[isLoading]);
  if(!v)return null;
  return(
    <>
      <style>{`
        .splash-scene{perspective:800px;perspective-origin:50% 50%;margin-bottom:32px;position:relative;z-index:1;}
        .splash-logo-3d{width:100px;height:100px;transform-style:preserve-3d;
          animation:logo3dEnter 1.6s cubic-bezier(0.34,1.2,0.64,1) both, logo3dFloat 4s ease-in-out 1.6s infinite alternate;}
        @keyframes logo3dEnter{
          0%{transform:rotateX(-90deg) rotateY(30deg) scale(0.3);opacity:0;}
          40%{transform:rotateX(12deg) rotateY(-8deg) scale(1.05);opacity:1;}
          65%{transform:rotateX(-6deg) rotateY(4deg) scale(0.98);}
          80%{transform:rotateX(3deg) rotateY(-2deg) scale(1.01);}
          100%{transform:rotateX(0deg) rotateY(0deg) scale(1);opacity:1;}}
        @keyframes logo3dFloat{
          from{transform:rotateX(0deg) rotateY(-4deg) translateY(0px);}
          to{transform:rotateX(4deg) rotateY(4deg) translateY(-6px);}}
        .splash-logo-face{width:100px;height:100px;border-radius:28px;
          background:linear-gradient(145deg,#f0f2f0 0%,#e2e6e3 100%);
          box-shadow:0 20px 60px rgba(0,0,0,0.14),0 6px 20px rgba(0,0,0,0.08),inset 0 2px 0 rgba(255,255,255,0.90),inset 0 -2px 0 rgba(0,0,0,0.06);
          display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
        .splash-logo-face::before{content:'';position:absolute;top:-30%;left:-30%;width:60%;height:60%;
          background:radial-gradient(ellipse,rgba(255,255,255,0.80) 0%,transparent 70%);border-radius:50%;
          animation:sheenMove 4s ease-in-out 1.6s infinite alternate;}
        @keyframes sheenMove{from{transform:translate(0,0);}to{transform:translate(20px,14px);}}
        .splash-logo-shadow{width:80px;height:16px;border-radius:50%;
          background:radial-gradient(ellipse,rgba(0,0,0,0.12) 0%,transparent 70%);margin-top:8px;
          animation:shadowPulse 4s ease-in-out 1.6s infinite alternate;}
        @keyframes shadowPulse{from{transform:scaleX(1.0);opacity:0.7;}to{transform:scaleX(0.85);opacity:0.4;}}
        .splash-title{font-size:28px;font-weight:900;letter-spacing:-0.8px;color:var(--text);
          opacity:0;transform:translateY(16px);animation:textReveal 0.6s cubic-bezier(0.34,1.4,0.64,1) 1.1s both;position:relative;z-index:1;}
        .splash-sub{font-size:13px;color:var(--text3);font-weight:600;margin-top:6px;
          opacity:0;transform:translateY(10px);animation:textReveal 0.5s cubic-bezier(0.34,1.4,0.64,1) 1.3s both;position:relative;z-index:1;}
        @keyframes textReveal{to{opacity:1;transform:translateY(0);}}
        .splash-dots{display:flex;gap:6px;margin-top:36px;opacity:0;animation:textReveal 0.4s ease 1.6s both;position:relative;z-index:1;}
        .splash-dot{width:6px;height:6px;border-radius:50%;background:var(--green);opacity:0.3;animation:dotPulse 1.2s ease-in-out infinite;}
        .splash-dot:nth-child(2){animation-delay:0.2s;}.splash-dot:nth-child(3){animation-delay:0.4s;}
        @keyframes dotPulse{0%,100%{opacity:0.25;transform:scale(0.85);}50%{opacity:1;transform:scale(1.15);background:var(--greenglow);}}
        .splash.exit{animation:splashExit 0.55s cubic-bezier(0.4,0,1,1) both;}
        @keyframes splashExit{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.06);pointer-events:none;}}
        .splash-bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 20% 20%,rgba(46,200,102,0.08) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(75,82,89,0.06) 0%,transparent 55%);animation:splashBgPulse 3s ease-in-out infinite alternate;}
        @keyframes splashBgPulse{from{opacity:0.6;}to{opacity:1;}}
      `}</style>
      <div className={`splash${exiting?" exit":""}`} style={{position:"fixed",inset:0,zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#e6ebe8 0%,#eceef0 50%,#e8ecee 100%)",overflow:"hidden"}}>
        <div className="splash-bg"/>
        <div className="splash-scene">
          <div className="splash-logo-3d">
            <div className="splash-logo-face">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="none">
                <defs>
                  <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#35d46e"/>
                    <stop offset="100%" stopColor="#1a8f45"/>
                  </linearGradient>
                </defs>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#sg)" stroke="none"/>
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>
          <div className="splash-logo-shadow"/>
        </div>
        <div className="splash-title">MedReconcile</div>
        <div className="splash-sub">Assurance & Performance</div>
        <div className="splash-dots">
          <div className="splash-dot"/><div className="splash-dot"/><div className="splash-dot"/>
        </div>
      </div>
    </>
  );
}

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({correctPassword,onUnlock,onLogout,userEmail}){
  const[pin,setPin]=useState("");const[err,setErr]=useState(false);
  const correct=String(correctPassword||"").trim();
  function tap(v){if(v==="del"){setPin(p=>p.slice(0,-1));return;}const next=pin+v;setPin(next);
    if(next.length===correct.length){if(next===correct)onUnlock();else{setErr(true);setTimeout(()=>{setPin("");setErr(false);},600);}}}
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative"}}>
      <div className="mesh-bg"/>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <motion.div animate={err?{x:[-10,10,-10,10,0]}:{}} transition={{duration:.4}}
          style={{width:88,height:88,borderRadius:32,background:"linear-gradient(135deg,#35d46e,#1a8f45)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 24px",
            boxShadow:"0 20px 48px rgba(46,200,102,0.38)"}}>🛡️</motion.div>
        <div style={{fontSize:24,fontWeight:900,color:"var(--text)",marginBottom:6}}>Acesso Seguro</div>
        <div style={{fontSize:13,color:"var(--text3)",marginBottom:32,fontWeight:600}}>{userEmail}</div>
        <div className="glass" style={{padding:32,marginBottom:24}}>
          <div style={{display:"flex",gap:14,justifyContent:"center",marginBottom:32}}>
            {Array.from({length:correct.length||4}).map((_,i)=>(
              <div key={i} style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(46,200,102,0.4)",
                transition:"all 0.18s",background:i<pin.length?"var(--green)":"transparent",
                transform:i<pin.length?"scale(1.2)":"scale(1)",boxShadow:i<pin.length?"0 0 8px rgba(46,200,102,0.5)":"none"}}/>
            ))}
          </div>
          {err&&<div style={{color:"var(--red)",fontSize:13,fontWeight:700,marginBottom:16}}>Senha incorreta</div>}
          <div className="pin-grid">
            {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
              <button key={i} onClick={()=>k&&tap(k)} className="pin-key"
                style={{opacity:k?"1":"0",pointerEvents:k?"auto":"none",fontSize:k==="del"?18:20}}>
                {k==="del"?"⌫":k}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:"var(--text3)",fontSize:13,fontWeight:700,cursor:"pointer"}}>Encerrar sessão</button>
      </motion.div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login(){
  const[loading,setL]=useState(false);const[error,setE]=useState("");const[msg,setM]=useState("");
  const[mode,setMode]=useState("login");const[email,setEmail]=useState("");const[pass,setPass]=useState("");
  useEffect(()=>{getRedirectResult(auth).then(r=>{if(r){const c=GoogleAuthProvider.credentialFromResult(r);if(c)setToken(c.accessToken);}}).catch(e=>setE(e.message));},[]);
  async function gLogin(){setL(true);setE("");try{await signInWithRedirect(auth,provider);}catch(e){setE(e.message);setL(false);}}
  async function hEmail(e){if(e)e.preventDefault();if(!email.trim()){setE("Digite seu email.");return;}setL(true);setE("");setM("");
    try{if(mode==="login")await signInWithEmailAndPassword(auth,email,pass);else if(mode==="register")await createUserWithEmailAndPassword(auth,email,pass);else{await sendPasswordResetEmail(auth,email);setM("Link enviado!");setMode("login");setL(false);}}catch(err){setE(err.message);setL(false);}}
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",position:"relative"}}>
      <div className="mesh-bg"/>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{position:"relative",zIndex:1,width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:84,height:84,borderRadius:30,background:"linear-gradient(135deg,#35d46e,#1a8f45)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 20px",
            boxShadow:"0 20px 48px rgba(46,200,102,0.40)"}}>🛡️</div>
          <div style={{fontSize:30,fontWeight:900,color:"var(--text)",letterSpacing:"-0.5px"}}>MedReconcile</div>
          <div style={{fontSize:14,color:"var(--text3)",marginTop:6,fontWeight:600}}>Assurance & Performance Médica</div>
        </div>
        <div className="glass" style={{padding:32}}>
          <div style={{fontSize:18,fontWeight:900,color:"var(--text)",marginBottom:4}}>{mode==="login"?"Acesse sua Conta":mode==="register"?"Criar Cadastro":"Recuperar Senha"}</div>
          <div style={{fontSize:13,color:"var(--text3)",marginBottom:24,fontWeight:600}}>Ambiente seguro e sincronizado.</div>
          {msg&&<div style={{padding:12,background:"rgba(46,200,102,0.10)",borderRadius:12,fontSize:13,color:"var(--green2)",fontWeight:700,marginBottom:16,border:"1px solid rgba(46,200,102,0.20)"}}>{msg}</div>}
          <form onSubmit={hEmail} style={{display:"flex",flexDirection:"column",gap:12}}>
            <input className="input" type="email" placeholder="E-mail profissional" value={email} onChange={e=>setEmail(e.target.value)}/>
            {mode!=="reset"&&<input className="input" type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)}/>}
            <button type="submit" className="btn-p" style={{width:"100%",padding:"15px",marginTop:4}} disabled={loading}>
              {loading&&<span className="spin" style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>}
              {mode==="login"?"Entrar":mode==="register"?"Criar Cadastro":"Enviar link"}
            </button>
          </form>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(0,0,0,0.06)"}}/><span style={{fontSize:11,color:"var(--text3)",fontWeight:800}}>OU</span><div style={{flex:1,height:1,background:"rgba(0,0,0,0.06)"}}/>
          </div>
          <button onClick={gLogin} disabled={loading} className="btn-g" style={{width:"100%",padding:"15px",gap:12,fontSize:15}}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg>
            Entrar com Google
          </button>
          {error&&<div style={{marginTop:16,padding:12,borderRadius:12,background:"rgba(217,64,64,0.08)",color:"var(--red)",fontSize:13,fontWeight:700}}>{error}</div>}
          <div style={{marginTop:20,textAlign:"center",fontSize:13,color:"var(--text3)"}}>
            {mode==="login"?(<><button onClick={()=>setMode("reset")} style={{background:"none",border:"none",color:"var(--green2)",fontWeight:800,cursor:"pointer",fontSize:13}}>Esqueci minha senha</button>{" · "}<button onClick={()=>setMode("register")} style={{background:"none",border:"none",color:"var(--green2)",fontWeight:800,cursor:"pointer",fontSize:13}}>Criar cadastro</button></>):(<button onClick={()=>setMode("login")} style={{background:"none",border:"none",color:"var(--green2)",fontWeight:800,cursor:"pointer",fontSize:13}}>Voltar ao login</button>)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── UNIDADES ────────────────────────────────────────────────────────────────
function Unidades({hospitals,addHospital,removeHospital,activeHosp,setActiveHosp,setTab,showToast}){
  const[name,setName]=useState("");const[saving,setSaving]=useState(false);const[conf,setConf]=useState(null);
  async function add(){if(!name.trim())return;setSaving(true);try{await addHospital(name.trim());setName("");showToast("Unidade adicionada!","success");}catch{showToast("Erro","error");}finally{setSaving(false);}}
  async function remove(id){try{await removeHospital(id);showToast("Removida","info");setConf(null);}catch{showToast("Erro","error");}}
  function activate(id){setActiveHosp(id);setTab("atendimentos");showToast("Unidade ativa!","success");}
  return(
    <div style={{padding:"20px 20px 100px",position:"relative",zIndex:1}}>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="glass" style={{padding:20,marginBottom:20}}>
        <div className="lbl">Nova Unidade</div>
        <input className="input" placeholder="Nome do hospital ou clínica" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:12}}/>
        <button className="btn-p" style={{width:"100%"}} onClick={add} disabled={saving}>
          {saving&&<span className="spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>}
          + Cadastrar Unidade
        </button>
      </motion.div>
      <div className="lbl" style={{marginBottom:12}}>Unidades Habilitadas ({hospitals.length})</div>
      {hospitals.length===0&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{padding:48,textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14}}>🏨</div>
          <div style={{fontWeight:800,color:"var(--text2)",fontSize:16}}>Nenhuma unidade cadastrada</div>
          <div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>Cadastre o hospital onde você atende.</div>
        </motion.div>
      )}
      <AnimatePresence>
        {hospitals.map((h,i)=>{const isActive=activeHosp===h.id;return(
          <motion.div key={h.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{delay:i*0.04}}
            className="glass" style={{padding:"16px 18px",marginBottom:12,borderLeft:isActive?"3px solid var(--green)":undefined,background:isActive?"rgba(46,200,102,0.03)":undefined}}>
            {conf===h.id?(
              <div><div style={{fontSize:13,fontWeight:800,color:"var(--red)",marginBottom:10}}>Excluir "{h.name}"?</div>
                <div style={{display:"flex",gap:8}}><button className="btn-d" onClick={()=>remove(h.id)}>Confirmar</button><button className="btn-g" style={{padding:"9px 14px",fontSize:13}} onClick={()=>setConf(null)}>Cancelar</button></div></div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:16,flexShrink:0,
                  background:isActive?"linear-gradient(135deg,#35d46e,#1a8f45)":"linear-gradient(145deg,rgba(255,255,255,0.80),rgba(255,255,255,0.55))",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                  boxShadow:isActive?"0 8px 20px rgba(46,200,102,0.38)":"var(--shadow)"}}>🏥</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:15,color:"var(--text)"}}>{h.name}</div>
                  <div style={{fontSize:12,color:isActive?"var(--green2)":"var(--text3)",fontWeight:700,marginTop:2}}>{isActive?"● Ativa":"Inativa"}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {!isActive&&<button className="btn-g" style={{padding:"8px 14px",fontSize:12}} onClick={()=>activate(h.id)}>Ativar</button>}
                  <button className="btn-d" style={{padding:"8px 12px"}} onClick={()=>setConf(h.id)}>🗑</button>
                </div>
              </div>
            )}
          </motion.div>
        );})}
      </AnimatePresence>
    </div>
  );
}

// ─── ATENDIMENTOS ─────────────────────────────────────────────────────────────
// Calcula dias em aberto
function diasAberto(data){if(!data)return 0;const d=new Date(data);const hoje=new Date();return Math.floor((hoje-d)/(1000*60*60*24));}
// Badge de alerta de tempo
function AlertaBadge({data}){const d=diasAberto(data);if(d<30)return null;const cor=d>=60?"var(--red)":"var(--orange)";const txt=d>=60?`⚠ ${d}d em aberto`:`⏰ ${d}d pendente`;return<span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:800,background:d>=60?"rgba(217,64,64,0.10)":"rgba(217,122,0,0.10)",color:cor,marginTop:4,border:`1px solid ${d>=60?"rgba(217,64,64,0.18)":"rgba(217,122,0,0.18)"}`}}>{txt}</span>;}

function Atendimentos({activeH,attendances,addAttendance,updateAttendance,removeAttendance,showToast}){
  const[showForm,setSF]=useState(false);const[editId,setEid]=useState(null);
  const[scanning,setScn]=useState(false);const[scanMsg,setSMsg]=useState("");
  const[saving,setSav]=useState(false);const[conf,setConf]=useState(null);
  const[form,setForm]=useState({nome:"",atendimento:"",convenio:"",valor:"",data:today()});
  const[mes,setMes]=useState("TODOS");
  const[batchPreview,setBatch]=useState(null); // revisão antes de salvar em lote
  const[showRelatorio,setRelatorio]=useState(false); // relatório mensal
  const[isOffline,setOffline]=useState(!navigator.onLine);
  const[offlineQueue,setQueue]=useState([]); // fila offline
  const fileRef=useRef();

  // Monitor de conexão
  useEffect(()=>{
    const on=()=>{setOffline(false);if(offlineQueue.length>0){showToast(`📶 Online! Sincronizando ${offlineQueue.length} registros...`,"info");offlineQueue.forEach(item=>addAttendance(item));setQueue([]);}};
    const off=()=>{setOffline(true);showToast("📵 Sem internet — salvando offline","info");};
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[offlineQueue]);

  if(!activeH)return(<div style={{padding:40,textAlign:"center",position:"relative",zIndex:1}}><motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{padding:48}}><div style={{fontSize:48,marginBottom:12}}>🏢</div><div style={{fontWeight:800,color:"var(--text2)"}}>Nenhuma unidade ativa</div><div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>Selecione um hospital na aba Início.</div></motion.div></div>);

  function reset(){setForm({nome:"",atendimento:"",convenio:"",valor:"",data:today()});setEid(null);}

  async function save(){
    if(!form.nome.trim()||!form.atendimento.trim()){showToast("Nome e Nº obrigatórios","error");return;}
    setSav(true);
    const item={...form,valor:parseFloat(form.valor)||0,status:editId?(attendances.find(x=>x.id===editId)?.status||"PENDENTE"):"PENDENTE"};
    try{
      if(isOffline){setQueue(q=>[...q,item]);showToast("💾 Salvo offline — sincronizará em breve","info");}
      else{if(editId){await updateAttendance(editId,item);showToast("Atualizado!","success");}else{await addAttendance(item);showToast("Adicionado!","success");}}
      reset();setSF(false);
    }catch{showToast("Erro ao salvar","error");}finally{setSav(false);}
  }

  function edit(a){setForm({nome:a.nome,atendimento:a.atendimento,convenio:a.convenio||"",valor:a.valor||"",data:a.data||today()});setEid(a.id);setSF(true);}
  async function remove(id){try{await removeAttendance(id);showToast("Removido","info");setConf(null);}catch{showToast("Erro","error");}}

  function extract(data){
    let a=data.analysis||data.data||data;
    if(typeof a==="string"){try{a=JSON.parse(a);}catch{try{a=JSON.parse(a.replace(/```json/g,"").replace(/```/g,"").trim());}catch{}}}
    return{nome:a.nome_paciente||a.nome||"",atendimento:a.numero_atendimento||a.atendimento||"",convenio:a.convenio||"",valor:"",data:a.data_atendimento||a.data||today()};
  }

  async function scan(files){
    if(!files||!files.length)return;
    setScn(true);
    // Aviso de cold start se for a primeira chamada do dia
    setSMsg("Inicializando Audit AI...");
    const coldStartTimer=setTimeout(()=>setSMsg("IA aquecendo... pode levar até 30s na primeira vez hoje ☕"),5000);
    try{
      const resultados=[];
      for(let i=0;i<files.length;i++){
        setSMsg(`Analisando ${i+1} de ${files.length}...`);
        const d=await callAI(files[i]);
        const ex=extract(d);
        resultados.push(ex);
      }
      clearTimeout(coldStartTimer);
      if(files.length===1){
        // 1 arquivo: preenche form direto
        setForm(resultados[0]);setSF(true);
      } else {
        // Lote: mostra revisão antes de salvar
        setBatch(resultados);
      }
      showToast(files.length>1?`${files.length} etiquetas lidas — revise antes de salvar`:"Etiqueta lida!","success");
    }catch(e){
      clearTimeout(coldStartTimer);
      showToast(e.message||"Erro ao processar","error");
    }
    setScn(false);setSMsg("");
  }

  async function confirmarLote(){
    if(!batchPreview)return;
    for(const item of batchPreview)await addAttendance({...item,valor:0,status:"PENDENTE"});
    setBatch(null);showToast(`${batchPreview.length} pacientes salvos!`,"success");
  }

  const meses=["TODOS",...new Set(attendances.map(a=>{if(!a.data)return null;const d=new Date(a.data);return`${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;}).filter(Boolean))].sort();
  const filtered=mes==="TODOS"?attendances:attendances.filter(a=>{if(!a.data)return false;const d=new Date(a.data);return`${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`===mes;});
  const pagos=filtered.filter(a=>a.status==="PAGO");
  const pendentes=filtered.filter(a=>a.status!=="PAGO");
  const tPago=pagos.reduce((s,a)=>s+(a.valorPago||a.valor||0),0);
  const tPend=pendentes.reduce((s,a)=>s+(a.valor||0),0);
  // Alertas de tempo
  const alertas30=pendentes.filter(a=>diasAberto(a.data)>=30&&diasAberto(a.data)<60).length;
  const alertas60=pendentes.filter(a=>diasAberto(a.data)>=60).length;
  // Relatório por convênio
  const porConvenio=CONVENIOS.map(c=>({c,pend:pendentes.filter(a=>a.convenio===c),pago:pagos.filter(a=>a.convenio===c)})).filter(x=>x.pend.length+x.pago.length>0);

  return(
    <div style={{padding:"20px 20px 100px",position:"relative",zIndex:1}}>

      {/* BADGE OFFLINE */}
      <AnimatePresence>
        {isOffline&&(
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{background:"rgba(217,64,64,0.10)",border:"1px solid rgba(217,64,64,0.20)",borderRadius:12,
              padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>📵</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"var(--red)"}}>Sem conexão</div>
              <div style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>Registros serão salvos quando voltar online{offlineQueue.length>0?` (${offlineQueue.length} na fila)`:""}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALERTAS DE PENDÊNCIAS ANTIGAS */}
      <AnimatePresence>
        {(alertas30>0||alertas60>0)&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{marginBottom:14}}>
            {alertas60>0&&(
              <div style={{background:"rgba(217,64,64,0.09)",border:"1px solid rgba(217,64,64,0.18)",borderRadius:12,
                padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>🚨</span>
                <div style={{fontSize:13,fontWeight:800,color:"var(--red)"}}>{alertas60} paciente{alertas60>1?"s":""} com +60 dias em aberto</div>
              </div>
            )}
            {alertas30>0&&(
              <div style={{background:"rgba(217,122,0,0.09)",border:"1px solid rgba(217,122,0,0.18)",borderRadius:12,
                padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>⏰</span>
                <div style={{fontSize:13,fontWeight:800,color:"var(--orange)"}}>{alertas30} paciente{alertas30>1?"s":""} com +30 dias em aberto</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AÇÕES */}
      <div style={{display:"flex",gap:10,marginBottom:scanning?10:20}}>
        <button className="btn-p" style={{flex:1,padding:"13px"}} disabled={scanning} onClick={()=>fileRef.current.click()}>
          {scanning?<span className="spin" style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>:"📷"}
          Capturar com IA
        </button>
        <button className="btn-g" style={{padding:"13px 16px"}} onClick={()=>{reset();setSF(v=>!v);}}>+ Manual</button>
        <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" multiple onChange={e=>{if(e.target.files?.length)scan(e.target.files);e.target.value="";}}/>
      </div>

      {/* COLD START / PROGRESSO */}
      <AnimatePresence>
        {scanning&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} style={{overflow:"hidden",marginBottom:14}}>
            <div style={{background:"rgba(46,200,102,0.08)",border:"1px dashed rgba(46,200,102,0.28)",borderRadius:12,
              padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span className="spin" style={{width:14,height:14,border:"2px solid rgba(46,200,102,.3)",borderTopColor:"var(--green)",borderRadius:"50%",display:"inline-block",flexShrink:0}}/>
              <div style={{fontSize:13,color:"#065F46",fontWeight:700}}>{scanMsg||"Processando..."}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVISÃO EM LOTE */}
      <AnimatePresence>
        {batchPreview&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{marginBottom:16}}>
            <div className="glass" style={{padding:20,borderLeft:"3px solid var(--green)"}}>
              <div style={{fontSize:14,fontWeight:900,color:"var(--green2)",marginBottom:4}}>✓ Revisar antes de salvar</div>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>{batchPreview.length} etiquetas lidas — confira os dados</div>
              {batchPreview.map((p,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.60)",borderRadius:12,padding:"10px 14px",marginBottom:8,border:"1px solid rgba(255,255,255,0.70)"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"var(--text)"}}>{p.nome||<span style={{color:"var(--text3)"}}>Nome não extraído</span>}</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>ID: {p.atendimento||"—"} · {p.convenio||"—"} · {fmtDt(p.data)}</div>
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <button className="btn-p" style={{flex:1}} onClick={confirmarLote}>✓ Salvar todos</button>
                <button className="btn-g" onClick={()=>setBatch(null)}>Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM MANUAL */}
      <AnimatePresence>
        {showForm&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} style={{overflow:"hidden",marginBottom:16}}>
            <div className="glass" style={{padding:20,borderLeft:"3px solid var(--green)"}}>
              <div style={{fontSize:14,fontWeight:900,color:"var(--green2)",marginBottom:16}}>{editId?"✎ Editar":"+ Novo"} Atendimento</div>
              <input className="input" placeholder="Paciente *" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} style={{marginBottom:10}}/>
              <input className="input" placeholder="Nº Atendimento *" value={form.atendimento} onChange={e=>setForm({...form,atendimento:e.target.value})} style={{marginBottom:10}}/>
              <select className="input" value={form.convenio} onChange={e=>setForm({...form,convenio:e.target.value})} style={{marginBottom:10}}>
                <option value="">Convênio...</option>{CONVENIOS.map(c=><option key={c}>{c}</option>)}
              </select>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                <input className="input" type="number" placeholder="Valor" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/>
                <input className="input" type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-p" style={{flex:1}} onClick={save} disabled={saving}>{editId?"Salvar":"Confirmar"}</button>
                <button className="btn-g" onClick={()=>{setSF(false);reset();}}>Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="glass" style={{padding:"16px 18px"}}>
          <div className="lbl" style={{marginBottom:6}}>PACIENTES A RECEBER</div>
          <div style={{fontSize:22,fontWeight:900,color:"var(--orange)"}}>{fmtBRL(tPend)}</div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:4,fontWeight:700}}>{pendentes.length} pendentes</div>
        </motion.div>
        <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="glass" style={{padding:"16px 18px"}}>
          <div className="lbl" style={{marginBottom:6}}>TOTAL RECEBIDO</div>
          <div style={{fontSize:22,fontWeight:900,color:"var(--green2)"}}>{fmtBRL(tPago)}</div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:4,fontWeight:700}}>{pagos.length} conciliados</div>
        </motion.div>
      </div>

      {/* FILTRO MÊS + BOTÃO RELATÓRIO */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10,marginBottom:14,scrollbarWidth:"none",alignItems:"center"}}>
        {meses.map(m=>(
          <button key={m} onClick={()=>setMes(m)} className={mes===m?"btn-p":"btn-g"} style={{padding:"7px 14px",fontSize:12,borderRadius:12,whiteSpace:"nowrap",flexShrink:0}}>
            {m==="TODOS"?"Todos":m}
          </button>
        ))}
        <button onClick={()=>setRelatorio(v=>!v)} className="btn-g" style={{padding:"7px 14px",fontSize:12,borderRadius:12,whiteSpace:"nowrap",flexShrink:0,marginLeft:"auto",color:showRelatorio?"var(--green2)":undefined}}>
          📊 Relatório
        </button>
      </div>

      {/* RELATÓRIO MENSAL */}
      <AnimatePresence>
        {showRelatorio&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} style={{overflow:"hidden",marginBottom:16}}>
            <div className="glass" style={{padding:20}}>
              <div style={{fontSize:14,fontWeight:900,color:"var(--text)",marginBottom:16}}>📊 Relatório por Convênio</div>
              {porConvenio.length===0?(
                <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",padding:16}}>Nenhum dado no período</div>
              ):porConvenio.map(({c,pend,pago})=>(
                <div key={c} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontWeight:800,fontSize:13,color:"var(--text)"}}>{c}</div>
                    <div style={{fontSize:11,color:"var(--text3)",fontWeight:700}}>{pend.length+pago.length} pac.</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{background:"rgba(217,122,0,0.08)",borderRadius:10,padding:"8px 12px"}}>
                      <div style={{fontSize:10,fontWeight:800,color:"var(--orange)",textTransform:"uppercase",letterSpacing:.5}}>A receber</div>
                      <div style={{fontSize:14,fontWeight:900,color:"var(--orange)",marginTop:2}}>{fmtBRL(pend.reduce((s,a)=>s+(a.valor||0),0))}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{pend.length} pac.</div>
                    </div>
                    <div style={{background:"rgba(46,200,102,0.08)",borderRadius:10,padding:"8px 12px"}}>
                      <div style={{fontSize:10,fontWeight:800,color:"var(--green2)",textTransform:"uppercase",letterSpacing:.5}}>Recebido</div>
                      <div style={{fontSize:14,fontWeight:900,color:"var(--green2)",marginTop:2}}>{fmtBRL(pago.reduce((s,a)=>s+(a.valorPago||a.valor||0),0))}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{pago.length} pac.</div>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{marginTop:8,height:4,background:"rgba(0,0,0,0.06)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"var(--green)",borderRadius:2,
                      width:`${pago.length+pend.length>0?Math.round(pago.length/(pago.length+pend.length)*100):0}%`,
                      transition:"width 0.6s ease"}}/>
                  </div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:4,fontWeight:600,textAlign:"right"}}>
                    {pago.length+pend.length>0?Math.round(pago.length/(pago.length+pend.length)*100):0}% conciliado
                  </div>
                </div>
              ))}
              {/* Total geral */}
              <div style={{background:"rgba(46,200,102,0.06)",borderRadius:14,padding:"12px 16px",border:"1px solid rgba(46,200,102,0.12)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"var(--text2)"}}>TOTAL GERAL</div>
                  <div style={{fontSize:14,fontWeight:900,color:"var(--green2)"}}>{fmtBRL(tPago+tPend)}</div>
                </div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>{pagos.length} pagos · {pendentes.length} pendentes</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {attendances.length===0&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{padding:48,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🌿</div><div style={{fontWeight:800,color:"var(--text2)"}}>Sem registros</div><div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>Capture com IA ou adicione manualmente.</div></motion.div>)}

      {/* LISTA PENDENTES */}
      {pendentes.length>0&&(<div style={{marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="lbl">Pacientes a Receber ({pendentes.length})</div>
          <div style={{fontSize:13,fontWeight:800,color:"var(--orange)"}}>{fmtBRL(tPend)}</div>
        </div>
        <AnimatePresence>
          {pendentes.map((a,i)=>(
            <motion.div key={a.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{delay:i*.03}}
              className="glass" style={{padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${diasAberto(a.data)>=60?"var(--red)":diasAberto(a.data)>=30?"var(--orange)":"var(--orange)"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0,marginRight:12}}>
                  <div style={{fontWeight:900,fontSize:15,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.nome}</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:3,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontWeight:700}}>ID: {a.atendimento}</span><span style={{opacity:.4}}>|</span><span>{fmtDt(a.data)}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                    {a.convenio&&<span className="badge-l">{a.convenio}</span>}
                    <AlertaBadge data={a.data}/>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontWeight:900,fontSize:16,color:"var(--text)"}}>{fmtBRL(a.valor)}</div>
                  {conf===a.id?(
                    <div style={{display:"flex",gap:6,marginTop:8}}>
                      <button className="btn-d" style={{padding:"6px 10px",fontSize:12}} onClick={()=>remove(a.id)}>Apagar</button>
                      <button className="btn-g" style={{padding:"6px 10px",fontSize:12}} onClick={()=>setConf(null)}>✕</button>
                    </div>
                  ):(
                    <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
                      <button className="btn-g" style={{padding:"7px 11px",fontSize:13}} onClick={()=>edit(a)}>✎</button>
                      <button className="btn-d" style={{padding:"7px 11px",fontSize:13}} onClick={()=>setConf(a.id)}>🗑</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>)}

      {/* LISTA PAGOS */}
      {pagos.length>0&&(<div style={{opacity:.85}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="lbl">Conciliados ({pagos.length})</div>
          <div style={{fontSize:13,fontWeight:800,color:"var(--green2)"}}>{fmtBRL(tPago)}</div>
        </div>
        {pagos.map(a=>(<motion.div key={a.id} initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{padding:"12px 16px",marginBottom:8,borderLeft:"3px solid var(--green)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1,minWidth:0,marginRight:10}}><div style={{fontWeight:800,fontSize:14,color:"var(--text2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.nome}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{fmtDt(a.data)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:14,color:"var(--green2)"}}>{fmtBRL(a.valorPago||a.valor)}</div><span className="badge-g" style={{marginTop:4}}>✓ Pago</span></div>
          </div>
        </motion.div>))}
      </div>)}
    </div>
  );
}

// ─── AUDITAGEM ────────────────────────────────────────────────────────────────
function Auditagem({activeH,attendances,updateAttendance,showToast}){
  const[loading,setL]=useState(false);const[progress,setProg]=useState("");const[res,setRes]=useState(null);
  const fileRef=useRef();
  if(!activeH)return(<div style={{padding:40,textAlign:"center",position:"relative",zIndex:1}}><motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{padding:48}}><div style={{fontSize:48,marginBottom:12}}>🏢</div><div style={{fontWeight:800,color:"var(--text2)"}}>Nenhuma unidade ativa</div></motion.div></div>);
  const pendentes=attendances.filter(a=>a.status!=="PAGO");const pagos=attendances.filter(a=>a.status==="PAGO");
  async function run(file){if(!file)return;setL(true);setRes(null);
    try{const name=file.name.toLowerCase();let crz=null;
      if(name.endsWith(".xlsx")||name.endsWith(".xls")){setProg("Lendo planilha...");
        const{read,utils}=await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
        const buf=await file.arrayBuffer();const wb=read(buf,{type:"array"});const rows=utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});
        if(rows.length>0){setProg("Cruzando dados...");const nn=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
          const rP=[],aP=[];for(const p of pendentes){const f=rows.find(r=>Object.values(r).map(v=>String(v||"")).some(v=>v===p.atendimento||(nn(v)===nn(p.nome)&&v.length>3)));if(f)rP.push({...p,status:"PAGO",valorPago:p.valor});else aP.push(p);}crz={recemPagos:rP,aindaPendentes:aP};}
      }else if(name.endsWith(".csv")){setProg("Lendo CSV...");const text=await file.text();const lines=text.split(/\r?\n/).filter(l=>l.trim());
        const nn=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
        const rP=[],aP=[];for(const p of pendentes){const f=lines.some(l=>l.includes(p.atendimento)||(nn(l).includes(nn(p.nome))&&p.nome.length>3));if(f)rP.push({...p,status:"PAGO",valorPago:p.valor});else aP.push(p);}crz={recemPagos:rP,aindaPendentes:aP};}
      if(!crz){setProg("Enviando para Audit AI...");const b=await toBase64(file);
        const csv="nome,atendimento\n"+pendentes.map(a=>`"${a.nome}","${a.atendimento}"`).join("\n");
        const r=await fetch(`${AI_URL}/gemini/extract`,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":AI_KEY},
          body:JSON.stringify({fileType:file.type||"application/pdf",base64Data:b,
            prompt:`Compare pacientes com relatório hospitalar. Para cada um diga PAGO ou PENDENTE.\nPacientes:\n${csv}\nRetorne JSON: {results:[{nome_paciente,numero_atendimento,status}]}`,
            schema:{type:"object",properties:{results:{type:"array",items:{type:"object",properties:{nome_paciente:{type:"string"},numero_atendimento:{type:"string"},status:{type:"string"}}}}}}})});
        const d=await r.json();const results=(d.analysis||d.data||d).results||[];
        const rP=[],aP=[];for(const p of pendentes){const f=results.find(r=>r.status==="PAGO"&&(r.numero_atendimento===p.atendimento||r.nome_paciente===p.nome));if(f)rP.push({...p,status:"PAGO",valorPago:p.valor});else aP.push(p);}crz={recemPagos:rP,aindaPendentes:aP};}
      setRes(crz);showToast(`✓ ${crz.recemPagos.length} pagamentos encontrados`,"success");
    }catch(e){showToast(e.message||"Erro","error");}setL(false);setProg("");}
  async function confirmar(){if(!res)return;for(const p of res.recemPagos)await updateAttendance(p.id,{status:"PAGO",valorPago:p.valorPago,dataPagamento:today()});setRes(null);showToast("✓ Conciliação efetivada!","success");}
  return(
    <div style={{padding:"20px 20px 100px",position:"relative",zIndex:1}}>
      {!res&&(
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
          {/* HERO CARD — visual do app original com glassmorphism por baixo */}
          <div style={{background:"linear-gradient(135deg,#2ec866 0%,#1a8f45 100%)",borderRadius:28,padding:28,marginBottom:20,
            boxShadow:"0 20px 48px rgba(46,200,102,0.32)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-24,right:-24,fontSize:120,opacity:.08}}>📊</div>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontWeight:900,fontSize:21,color:"#fff",marginBottom:6}}>Conciliação Inteligente</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.82)",lineHeight:1.6,marginBottom:20}}>Cruze o extrato do hospital com seus lançamentos automaticamente via IA.</div>
              <div style={{background:"rgba(255,255,255,0.16)",borderRadius:14,padding:"10px 16px",display:"inline-block",border:"1px solid rgba(255,255,255,0.22)",marginBottom:20}}>
                <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.60)",textTransform:"uppercase",letterSpacing:1}}>Aguardando</div>
                <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{pendentes.length} <span style={{fontSize:12,opacity:.8}}>Pacientes</span></div>
              </div>
              {loading?(
                <div style={{background:"rgba(255,255,255,0.14)",borderRadius:16,padding:20,textAlign:"center",border:"1px dashed rgba(255,255,255,0.28)"}}>
                  <div className="spin" style={{width:28,height:28,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>
                  <div style={{fontSize:13,color:"#fff",fontWeight:800,marginTop:10}}>{progress}</div>
                </div>
              ):(
                <button onClick={()=>fileRef.current.click()}
                  style={{width:"100%",padding:17,background:"#fff",color:"#065F46",fontWeight:900,fontSize:15,border:"none",borderRadius:16,cursor:"pointer",boxShadow:"0 10px 24px rgba(0,0,0,0.12)",transition:"transform 0.18s"}}
                  onMouseEnter={e=>e.target.style.transform="translateY(-1px)"} onMouseLeave={e=>e.target.style.transform="none"}>
                  🚀 Carregar Extrato Bancário/Hospital
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={e=>{run(e.target.files[0]);e.target.value="";}}/>
          </div>
          {pendentes.length>0&&(<div>
            <div className="lbl" style={{marginBottom:10}}>Aguardando Recebimento ({pendentes.length})</div>
            <div className="glass" style={{padding:0,overflow:"hidden"}}>
              {pendentes.map((a,i)=>(<div key={a.id} style={{padding:"14px 18px",borderBottom:i<pendentes.length-1?"1px solid rgba(0,0,0,0.04)":undefined,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:800,fontSize:14,color:"var(--text2)"}}>{a.nome}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{fmtDt(a.data)}</div></div>
                <div style={{fontWeight:800,fontSize:14,color:"var(--text3)"}}>{fmtBRL(a.valor)}</div>
              </div>))}
            </div>
          </div>)}
        </motion.div>
      )}
      <AnimatePresence>
        {res&&(<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {[{l:"CONCILIADOS",v:res.recemPagos.length,c:"var(--green2)",s:fmtBRL(res.recemPagos.reduce((s,r)=>s+(r.valorPago||0),0))},
              {l:"NÃO ENCONTRADOS",v:res.aindaPendentes.length,c:"var(--orange)",s:fmtBRL(res.aindaPendentes.reduce((s,r)=>s+(r.valor||0),0))}].map(({l,v,c,s})=>(
              <div key={l} className="glass" style={{padding:"16px 18px"}}>
                <div className="lbl" style={{marginBottom:6}}>{l}</div>
                <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:4,fontWeight:700}}>{s}</div>
              </div>))}
          </div>
          {res.recemPagos.length>0&&(<div style={{marginBottom:16}}>
            <div className="lbl" style={{marginBottom:10}}>Pagamentos Identificados</div>
            {res.recemPagos.map(r=>(<motion.div key={r.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="glass" style={{padding:"14px 16px",marginBottom:8,borderLeft:"3px solid var(--green)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,minWidth:0,marginRight:12}}><div style={{fontWeight:900,fontSize:14,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nome}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>ID: {r.atendimento} · {fmtDt(r.data)}</div></div>
                <div style={{fontWeight:900,fontSize:15,color:"var(--green2)"}}>{fmtBRL(r.valorPago||r.valor)}</div>
              </div>
            </motion.div>))}
          </div>)}
          {res.aindaPendentes.length>0&&(<div style={{opacity:.72,marginBottom:20}}>
            <div className="lbl" style={{marginBottom:10}}>Permanecem Pendentes</div>
            {res.aindaPendentes.map(r=>(<div key={r.id} className="glass" style={{padding:"12px 16px",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:13,fontWeight:800,color:"var(--text3)"}}>{r.nome}</div>
              <div style={{fontSize:13,fontWeight:800,color:"var(--text3)"}}>{fmtBRL(r.valor)}</div>
            </div>))}
          </div>)}
          <div style={{display:"flex",gap:10,marginBottom:40}}>
            {res.recemPagos.length>0&&<button className="btn-p" style={{flex:1,padding:14}} onClick={confirmar}>✓ Efetivar Conciliação</button>}
            <button className="btn-g" style={{padding:14}} onClick={()=>setRes(null)}>Voltar</button>
          </div>
        </motion.div>)}
      </AnimatePresence>
      {!res&&pagos.length>0&&(<div style={{opacity:.85}}>
        <div className="lbl" style={{marginBottom:10}}>Conciliados ({pagos.length})</div>
        <div className="glass" style={{padding:0,overflow:"hidden"}}>
          {pagos.map((a,i)=>(<div key={a.id} style={{padding:"14px 18px",borderBottom:i<pagos.length-1?"1px solid rgba(0,0,0,0.04)":undefined,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:800,fontSize:14,color:"var(--text2)"}}>{a.nome}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>ID: {a.atendimento}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:14,color:"var(--green2)"}}>{fmtBRL(a.valorPago||a.valor)}</div><span className="badge-g" style={{marginTop:4}}>✓</span></div>
          </div>))}
        </div>
      </div>)}
    </div>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
function Configuracoes({profile,updateProfile,hospitals,attendances,logout,showToast,user,ensureDriveAccess}){
  const[form,setForm]=useState(profile);const[saving,setSav]=useState(false);const[saved,setSaved]=useState(false);
  const[iaS,setIaS]=useState(null);const[iaL,setIaL]=useState(false);const[showPass,setSP]=useState(false);
  useEffect(()=>{setForm(profile);},[profile]);
  const allAtts=Object.values(attendances).flat();const totalVal=allAtts.reduce((s,a)=>s+(parseFloat(a.valor)||0),0);
  async function save(){setSav(true);try{await updateProfile(form);setSaved(true);showToast("✓ Perfil atualizado!","success");setTimeout(()=>setSaved(false),2500);}catch{showToast("Erro","error");}finally{setSav(false);}}
  function dlExcel(){try{const data=[];Object.keys(attendances).forEach(hid=>{const h=hospitals.find(x=>x.id===hid);(attendances[hid]||[]).forEach(a=>data.push({"Profissional":profile.name||"N/A","CRM":profile.crm||"N/A","Data":a.data,"Unidade":h?h.name:"N/A","Paciente":a.nome,"Atendimento":a.atendimento,"Convênio":a.convenio||"","Valor":a.valor||0,"Status":a.status||"PENDENTE"}));});if(!data.length){showToast("Sem dados","error");return;}const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Backup");XLSX.writeFile(wb,`Backup_MedReconcile_${today()}.xlsx`);showToast("Excel exportado!","success");}catch{showToast("Erro","error");}}
  async function dlDrive(){const ok=await ensureDriveAccess();if(!ok)return;const token=getToken();if(!token){showToast("Token inválido","error");return;}try{setSav(true);showToast("⏳ Preparando...","info");const data=[];Object.keys(attendances).forEach(hid=>{const h=hospitals.find(x=>x.id===hid);(attendances[hid]||[]).forEach(a=>data.push({"Profissional":profile.name||"N/A","Paciente":a.nome,"Atendimento":a.atendimento,"Unidade":h?h.name:"N/A","Convênio":a.convenio||"","Valor":a.valor||0,"Status":a.status||"PENDENTE"}));});if(!data.length){showToast("Sem dados","error");setSav(false);return;}const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Backup");const buf=XLSX.write(wb,{bookType:"xlsx",type:"array"});const blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});const name=`Backup_${today()}.xlsx`;const bd="MedBd";const meta={name,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};const body=new Blob([`--${bd}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n--${bd}\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`,blob,`\r\n--${bd}--`],{type:`multipart/related; boundary=${bd}`});const r=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",{method:"POST",headers:{Authorization:`Bearer ${token}`},body});if(!r.ok)throw new Error();showToast("✓ Salvo no Google Drive!","success");}catch{showToast("Erro ao enviar ao Drive","error");}finally{setSav(false);}}
  async function testIA(){setIaL(true);setIaS(null);try{const r=await fetch(`${AI_URL}/health`);if(r.ok){setIaS("success");showToast("Conexão estabelecida!","success");}else{setIaS("error");showToast("Falha na conexão","error");}}catch(e){setIaS("error");showToast("Offline — "+e.message,"error");}setIaL(false);}
  return(
    <div style={{padding:"20px 20px 100px",position:"relative",zIndex:1}}>
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="glass" style={{padding:24,textAlign:"center",marginBottom:20}}>
        <div style={{width:80,height:80,borderRadius:28,background:"linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,255,255,0.55))",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontWeight:900,color:"var(--lead)",
          margin:"0 auto 16px",boxShadow:"var(--shadow2)"}}>
          {form.name?form.name[0].toUpperCase():"DR"}
        </div>
        <div style={{fontSize:20,fontWeight:900,color:"var(--text)"}}>{form.name||"Médico Credenciado"}</div>
        <div style={{fontSize:12,color:"var(--green2)",fontWeight:800,marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{form.especialidade||"Especialista"}</div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{user?.email}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20}}>
          {[{l:"Lançamentos",v:allAtts.length},{l:"Estimado Total",v:fmtBRL(totalVal)}].map(({l,v})=>(
            <div key={l} style={{background:"rgba(255,255,255,0.52)",borderRadius:14,padding:"12px 14px"}}>
              <div className="lbl" style={{marginBottom:4}}>{l}</div>
              <div style={{fontSize:16,fontWeight:900,color:"var(--text)"}}>{v}</div>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="lbl" style={{marginBottom:10}}>Configurações Profissionais</div>
      <div className="glass" style={{padding:20,marginBottom:20}}>
        <input className="input" placeholder="Nome no Prontuário" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} style={{marginBottom:10}}/>
        <input className="input" placeholder="CRM (000000-UF)" value={form.crm||""} onChange={e=>setForm({...form,crm:e.target.value})} style={{marginBottom:10}}/>
        <input className="input" placeholder="Especialidade" value={form.especialidade||""} onChange={e=>setForm({...form,especialidade:e.target.value})} style={{marginBottom:10}}/>
        <div style={{position:"relative",marginBottom:16}}>
          <input className="input" type={showPass?"text":"password"} placeholder="Senha de Acesso (App Lock)" value={form.appPassword||""} onChange={e=>setForm({...form,appPassword:e.target.value})}/>
          <button onClick={()=>setSP(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,opacity:.5}}>{showPass?"🔓":"🔏"}</button>
        </div>
        <button className="btn-p" style={{width:"100%"}} onClick={save} disabled={saving}>
          {saving&&<span className="spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>}
          {saved?"✓ Perfil Sincronizado":"Atualizar Perfil"}
        </button>
      </div>
      <div className="lbl" style={{marginBottom:10}}>Nuvem e Exportação</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <button onClick={dlExcel} className="glass" style={{padding:20,border:"none",cursor:"pointer",textAlign:"left",borderRadius:24}}>
          <div style={{fontSize:28,marginBottom:8}}>📗</div>
          <div style={{fontWeight:900,fontSize:14,color:"var(--text)"}}>Excel</div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>Download direto para seu dispositivo</div>
        </button>
        <button onClick={dlDrive} style={{padding:20,border:"none",cursor:"pointer",textAlign:"left",borderRadius:24,
          background:"linear-gradient(135deg,#272d32,var(--lead3))",boxShadow:"var(--shadow2)"}}>
          <div style={{fontSize:28,marginBottom:8}}>☁️</div>
          <div style={{fontWeight:900,fontSize:14,color:"#fff"}}>Google Drive</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:4}}>Sincronização em nuvem pessoal</div>
        </button>
      </div>
      <div className="lbl" style={{marginBottom:10}}>Integração Audit AI</div>
      <div className="glass" style={{padding:20,marginBottom:20}}>
        <div style={{fontSize:13,color:"var(--text2)",fontWeight:700,marginBottom:14}}>Serviço de Processamento Inteligente</div>
        <button onClick={testIA} disabled={iaL} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#272d32,var(--lead3))",color:"#fff",border:"none",borderRadius:14,fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {iaL&&<span className="spin" style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>}
          {iaL?"Conectando...":"Testar Conexão com Audit AI"}
        </button>
        {iaS&&(<motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} style={{marginTop:12,padding:"14px 16px",borderRadius:14,
          background:iaS==="success"?"rgba(46,200,102,0.08)":"rgba(217,64,64,0.08)",
          border:iaS==="success"?"1px solid rgba(46,200,102,0.20)":"1px solid rgba(217,64,64,0.15)"}}>
          <div style={{fontWeight:800,fontSize:13,color:iaS==="success"?"var(--green2)":"var(--red)"}}>{iaS==="success"?"● Conectada":"● Falha na conexão"}</div>
        </motion.div>)}
      </div>
      <button className="btn-d" style={{width:"100%",padding:14,borderRadius:16,fontSize:15}} onClick={async()=>{if(window.confirm("Deseja sair?"))await logout();}}>Encerrar Sessão</button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(undefined);const[tab,setTab]=useState(()=>localStorage.getItem("med_tab")||"unidades");
  const[hospitals,setHosps]=useState([]);const[activeHosp,setActiveH]=useState(()=>localStorage.getItem("med_hosp")||null);
  const[attendances,setAtts]=useState({});const[profile,setProfile]=useState({name:"",crm:"",email:"",especialidade:"",appPassword:""});
  const[loading,setLoading]=useState(true);const[isUnlocked,setUnlocked]=useState(false);
  const[showSplash,setSplash]=useState(true);const[toasts,setToasts]=useState([]);
  useEffect(()=>{localStorage.setItem("med_tab",tab);},[tab]);
  useEffect(()=>{if(activeHosp)localStorage.setItem("med_hosp",activeHosp);else localStorage.removeItem("med_hosp");},[activeHosp]);
  useEffect(()=>{
    let uP,uH,uA;
    const uAuth=onAuthStateChanged(auth,async u=>{
      if(u){setUser({id:u.uid,email:u.email,uid:u.uid,displayName:u.displayName});
        uP=onSnapshot(doc(db,"users",u.uid,"data","profile"),async snap=>{if(snap.exists())setProfile(p=>({...p,...snap.data()}));else{const p={name:u.displayName||"",email:u.email||"",crm:"",especialidade:"",appPassword:""};try{await setDoc(doc(db,"users",u.uid,"data","profile"),p);setProfile(p);}catch{}}setLoading(false);},()=>setLoading(false));
        uH=onSnapshot(collection(db,"users",u.uid,"hospitals"),snap=>setHosps(snap.docs.map(d=>({id:d.id,...d.data()}))));
        uA=onSnapshot(collection(db,"users",u.uid,"attendances"),snap=>{const ats={};snap.docs.forEach(d=>{const data=d.data();if(!ats[data.hospId])ats[data.hospId]=[];ats[data.hospId].push({id:d.id,...data});});setAtts(ats);});}
      else{setUser(null);setProfile({name:"",crm:"",email:"",especialidade:"",appPassword:""});setHosps([]);setAtts({});setLoading(false);setUnlocked(false);if(uP)uP();if(uH)uH();if(uA)uA();}
    });return()=>{uAuth();if(uP)uP();if(uH)uH();if(uA)uA();};
  },[]);
  const showToast=useCallback((msg,type="info")=>{const id=Date.now();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);},[]);
  const addHospital=async n=>{if(!user)return;await saveHosp(user.id,{id:uid(),name:n,createdAt:new Date().toISOString()});};
  const removeHospital=async id=>{if(!user)return;if(activeHosp===id)setActiveH(null);await delHosp(user.id,id);};
  const addAtt=async a=>{if(!user)return;await saveAtt(user.id,{...a,id:uid(),hospId:activeHosp});};
  const updateAtt=async(id,a)=>{if(!user)return;const ex=(attendances[activeHosp]||[]).find(x=>x.id===id);if(ex)await saveAtt(user.id,{...ex,...a});};
  const removeAtt=async id=>{if(!user)return;await delAtt(user.id,id);};
  const updateProfile=async p=>{const u={...profile,...p};setProfile(u);await saveProfile(user.id,u);};
  const logout=async()=>{await signOut(auth);setUser(null);setUnlocked(false);};
  async function ensureDriveAccess(){if(getToken())return true;try{showToast("⏳ Solicitando permissão...","info");const r=await signInWithPopup(auth,provider);const c=GoogleAuthProvider.credentialFromResult(r);if(c){setToken(c.accessToken);showToast("✓ Conectado ao Drive","success");return true;}}catch{showToast("Não foi possível conectar ao Drive","error");}return false;}
  const activeH=hospitals.find(h=>h.id===activeHosp);const hospAtts=activeHosp?(attendances[activeHosp]||[]):[];
  const title=tab==="atendimentos"&&activeH?activeH.name:TITLES[tab];
  let content=null;
  if(user===undefined||loading)content=null;
  else if(!user)content=<Login/>;
  else if(profile.appPassword&&!isUnlocked)content=<PasswordGate correctPassword={profile.appPassword} onUnlock={()=>{setUnlocked(true);setTab("unidades");}} onLogout={logout} userEmail={user.email}/>;
  else content=(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative"}}>
      <div style={{padding:"20px 20px 14px",position:"sticky",top:0,zIndex:40,
        background:"linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.55))",
        backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(255,255,255,0.75)",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        boxShadow:"0 2px 20px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <motion.div whileHover={{rotate:8,scale:1.05}}
            style={{width:42,height:42,borderRadius:15,
              background:"linear-gradient(145deg,#f0f2f0,#e4e8e5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 14px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.90)"}}>
            <svg width="26" height="26" viewBox="0 0 56 56" fill="none">
              <rect x="36" y="8" width="4" height="12" rx="2" fill="#2ec866" opacity="0.9"/>
              <rect x="32" y="12" width="12" height="4" rx="2" fill="#2ec866" opacity="0.9"/>
              <path d="M8 40V18l10 14 10-14v22" stroke="#2ec866" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 40V20h8a6 6 0 010 12H30M38 32l8 8" stroke="#2ec866" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="46" cy="40" r="3" fill="#2ec866" opacity="0.6"/>
            </svg>
          </motion.div>
          <div>
            <div style={{fontWeight:900,fontSize:17,color:"var(--text)",letterSpacing:"-.3px"}}>{title}</div>
            <div style={{fontSize:12,color:"var(--text3)",fontWeight:700}}>{user.email.split("@")[0]}</div>
          </div>
        </div>
        <motion.button whileHover={{scale:1.06}} whileTap={{scale:.94}}
          onClick={()=>setTab("config")}
          style={{width:42,height:42,borderRadius:21,background:"linear-gradient(135deg,#35d46e,#1a8f45)",
            border:"2px solid rgba(255,255,255,0.82)",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",
            boxShadow:"0 8px 22px rgba(46,200,102,0.42),inset 0 1px 0 rgba(255,255,255,0.28)"}}>
          {profile.name?profile.name[0].toUpperCase():user.email[0].toUpperCase()}
        </motion.button>
      </div>
      <div style={{paddingBottom:100}}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:.2}}>
            {tab==="unidades"&&<Unidades hospitals={hospitals} addHospital={addHospital} removeHospital={removeHospital} activeHosp={activeHosp} setActiveHosp={setActiveH} setTab={setTab} showToast={showToast}/>}
            {tab==="atendimentos"&&<Atendimentos activeH={activeH} attendances={hospAtts} addAttendance={addAtt} updateAttendance={updateAtt} removeAttendance={removeAtt} showToast={showToast}/>}
            {tab==="auditagem"&&<Auditagem activeH={activeH} attendances={hospAtts} updateAttendance={updateAtt} showToast={showToast} hospitals={hospitals} patients={Object.values(attendances).flat()} profile={profile}/>}
            {tab==="config"&&<Configuracoes profile={profile} updateProfile={updateProfile} hospitals={hospitals} attendances={attendances} logout={logout} showToast={showToast} user={user} ensureDriveAccess={ensureDriveAccess}/>}
          </motion.div>
        </AnimatePresence>
      </div>
      <nav className="nav">
        {TABS.map(t=>(
          <button key={t.id} className={`nav-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
            <t.Ico/>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
  return(<>
    <G/>
    <div className="mesh-bg"/>
    {showSplash&&<Splash isLoading={user===undefined||loading} onComplete={()=>setSplash(false)}/>}
    <div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast toast-${t.type}`}><span>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}</span>{t.msg}</div>)}</div>
    {content}
  </>);
}
