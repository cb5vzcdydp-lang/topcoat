/** Move a whole exercise without mutating its settings or losing any entries. */
export function moveItem<T>(items:T[],from:number,to:number):T[]{
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length||from===to)return items;
 const next=[...items], [item]=next.splice(from,1);next.splice(to,0,item);return next;
}
/** Keep each exercise's set order, including warm-ups and interleaved added sets. */
export function orderExerciseSets<T extends {exerciseId:string}>(sets:T[],order:string[]):T[]{
 const groups=new Map<string,T[]>();for(const set of sets){const group=groups.get(set.exerciseId)||[];group.push(set);groups.set(set.exerciseId,group)}
 const ids=[...new Set([...order,...groups.keys()])];return ids.flatMap(id=>groups.get(id)||[]);
}
