import React,{createContext,useContext,useState} from 'react';
import Toast from './Toast';
type ToastType='success'|'error'|'info'|'warning';
type ToastModel={id:string;message:string;type:ToastType;duration:number};
const Context=createContext<{showToast:(message:string,type:ToastType,duration?:number)=>void}|undefined>(undefined);
export const useToast=()=>{const value=useContext(Context);if(!value)throw new Error('useToast must be used within ToastProvider');return value;};
export const ToastProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const [toasts,setToasts]=useState<ToastModel[]>([]);
 const showToast=(message:string,type:ToastType,duration=5000)=>setToasts(old=>[...old,{id:Math.random().toString(36).slice(2),message,type,duration}].slice(-4));
 const removeToast=(id:string)=>setToasts(old=>old.filter(t=>t.id!==id));
 return <Context.Provider value={{showToast}}>{children}<div className="nx-toasts" aria-live="polite">{toasts.map(t=><Toast key={t.id} message={t.message} type={t.type} isVisible onClose={()=>removeToast(t.id)} duration={t.duration}/>)}</div></Context.Provider>;
};
