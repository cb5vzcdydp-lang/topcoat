const values=new Map<string,unknown>();
export function readViewState<T>(key:string|undefined,fallback:T):T{return key&&values.has(key)?values.get(key) as T:fallback;}
export function writeViewState(key:string|undefined,value:unknown){if(!key)return;if(values.size>=100&&!values.has(key))values.delete(values.keys().next().value!);values.set(key,value);}
