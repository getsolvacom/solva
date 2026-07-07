import { useEffect } from "react";
import { C } from "../../tokens";
import { CHANGELOG } from "../../data/changelog";

const TAG_COLORS = {
  New:      { color: C.teal,  background: "rgba(62,207,178,.12)" },
  Improved: { color: C.blue,  background: "rgba(91,173,255,.12)" },
  Fixed:    { color: C.coral, background: "rgba(229,82,102,.12)" },
};

export const WHATS_NEW_SEEN_KEY = "solva_whatsnew_seen";

export default function WhatsNewModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const newest = CHANGELOG[0]?.date;
    if (newest) localStorage.setItem(WHATS_NEW_SEEN_KEY, newest);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:10010,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={onClose}
    >
      <div
        style={{background:C.card,border:"1px solid var(--border-hi)",borderRadius:16,maxWidth:480,width:"92%",padding:28,maxHeight:"85vh",overflowY:"auto",fontFamily:"'Outfit',sans-serif"}}
        onClick={(e)=>e.stopPropagation()}
      >
        <h3 style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>What's New</h3>

        <div>
          {CHANGELOG.map((entry, i) => {
            const tagStyle = TAG_COLORS[entry.tag] || TAG_COLORS.New;
            return (
              <div
                key={`${entry.date}-${entry.title}`}
                style={{paddingTop:i===0?18:16,paddingBottom:i===CHANGELOG.length-1?0:16,borderTop:i===0?"none":"1px solid var(--border)"}}
              >
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10.5,fontWeight:700,padding:"3px 9px",borderRadius:100,textTransform:"uppercase",color:tagStyle.color,background:tagStyle.background}}>{entry.tag}</span>
                  <span style={{fontSize:11,color:"var(--muted)"}}>{entry.date}</span>
                </div>
                <div style={{fontSize:14.5,fontWeight:700,color:C.text,marginTop:6}}>{entry.title}</div>
                <p style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginTop:4}}>{entry.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
