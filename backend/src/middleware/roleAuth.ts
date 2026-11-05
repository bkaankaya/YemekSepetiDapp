import {Request,Response,NextFunction} from 'express';
import {createHash,timingSafeEqual} from 'node:crypto';
import {logger} from '../utils/logger.js';
import {UserRole} from '../data/types.js';

function isMatch(presented:string,configured:string|undefined):boolean{
 if(!configured || configured.length<32)return false;
 const left=createHash('sha256').update(presented).digest();
 const right=createHash('sha256').update(configured).digest();
 return timingSafeEqual(left,right);
}

// Never trust a role encoded in an attacker-controlled API key string.
// Keys live server-side only and must be independently provisioned.
export const requireRole=(allowedRoles:UserRole[])=>(req:Request,res:Response,next:NextFunction)=>{
 const key=req.headers['x-api-key'];
 const ownerKey=process.env.OWNER_API_KEY;
 const restaurantKey=process.env.RESTAURANT_API_KEY;
 if(!ownerKey || ownerKey.length<32){
   logger.error('Protected API keys are not configured');
   return res.status(503).json({error:'Protected API authentication not configured'});
 }
 if(typeof key!=='string')return res.status(401).json({error:'API key gerekli'});
 let role:UserRole|null=null;
 if(isMatch(key,ownerKey))role=UserRole.OWNER;
 else if(isMatch(key,restaurantKey))role=UserRole.RESTAURANT;
 if(!role || !allowedRoles.includes(role)){
   logger.warn('Unauthorized protected API access',{path:req.path,ip:req.ip});
   return res.status(403).json({error:'Bu işlem için yetkiniz yok'});
 }
 req.userRole=role;
 // Wallet identity requires a verified signature; cannot be extracted from a key string.
 req.userWalletAddress=undefined;
 next();
};
export const requireRestaurantOrOwner=requireRole([UserRole.RESTAURANT,UserRole.OWNER]);
export const requireOwner=requireRole([UserRole.OWNER]);
export const requireRestaurant=requireRole([UserRole.RESTAURANT]);

declare global{
 namespace Express{
  interface Request{userRole?:UserRole;userWalletAddress?:string;}
 }
}
