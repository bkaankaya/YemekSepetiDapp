import React,{useEffect} from 'react';
type Kind='success'|'error'|'info'|'warning';
const Toast:React.FC<{message:string;type:Kind;isVisible:boolean;onClose:()=>void;duration?:number}>=({message,type,isVisible,onClose,duration=5000})=>{
 useEffect(()=>{if(!isVisible||duration<=0)return;const timer=setTimeout(onClose,duration);return()=>clearTimeout(timer);},[isVisible,duration,onClose]);
 if(!isVisible)return null;
 return <div className={'nx-toast nx-toast-'+type} role={type==='error'?'alert':'status'}><span className="nx-toast-icon" aria-hidden="true">{type==='success'?'✓':type==='info'?'ⓘ':'!'}</span><span>{message}</span><button onClick={onClose} aria-label="Bildirimi kapat">✕</button></div>;
};
export default Toast;
