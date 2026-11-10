'use client';
import React,{useEffect,useState} from 'react';
import {authFetch} from '@/lib/auth-fetch';
export function AvatarImage({src,alt=''}:{src:string;alt?:string}){
 const [resolved,setResolved]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true,url='';setResolved('');setFailed(false);
  if(!src.startsWith('/api/')){setResolved(src);return;}
  authFetch(src).then(async r=>{if(!r.ok)throw new Error('Image unavailable');return r.blob()}).then(blob=>{if(active){url=URL.createObjectURL(blob);setResolved(url)}}).catch(()=>{if(active)setFailed(true)});
  return()=>{active=false;if(url)URL.revokeObjectURL(url)};
 },[src]);
 return resolved&&!failed?<img src={resolved} alt={alt} onError={()=>setFailed(true)} style={failed?{display:'none'}:undefined}/>:<span className="avatar-image-placeholder" role="img" aria-label={failed?'Avatar unavailable':'Loading avatar'}>👤</span>;
}
