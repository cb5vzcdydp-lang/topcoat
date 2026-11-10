import {z} from 'zod';

export const defaultMealGroups=['Uncategorized','Breakfast','Lunch','Dinner','Snacks'];
export const mealGroupName=z.string().trim().min(1).max(30);
export function preferredMealGroup(groups:string[],wanted?:string){return wanted&&groups.includes(wanted)?wanted:groups.includes('Breakfast')?'Breakfast':groups[0]||'Uncategorized';}
export const mealGroupList=z.array(mealGroupName).min(1).max(30).refine(groups=>new Set(groups.map(g=>g.toLowerCase())).size===groups.length,'Use a different name for each meal group.').refine(groups=>groups.includes('Uncategorized'),'Keep Uncategorized for foods without a group.');
export function resolveMealGroups(records:any[],meals:{data:any}[]) {
  const config=records.find(row=>row.kind==='meal-group-settings');
  const parsed=mealGroupList.safeParse(config?.data?.groups);
  const extras=records.filter(row=>row.kind==='meal-category'&&!row.deleted&&!row.data.hidden).sort((a,b)=>(a.data.order||0)-(b.data.order||0)).map(row=>row.data.name);
  return [...new Set([...(parsed.success?parsed.data:defaultMealGroups),...extras,...meals.map(row=>row.data.category).filter(Boolean)])];
}
export const mealGroupsRequest=z.object({client:z.string().uuid(),version:z.number().int().min(0),groups:mealGroupList,renames:z.array(z.object({from:mealGroupName,to:mealGroupName})).max(30).default([])}).superRefine((body,ctx)=>{
  if(new Set(body.renames.map(r=>r.from)).size!==body.renames.length)ctx.addIssue({code:'custom',message:'Rename each original group once.'});
  if(body.renames.some(r=>r.from==='Uncategorized'||!body.groups.includes(r.to)))ctx.addIssue({code:'custom',message:'Keep Uncategorized and include every renamed group in the final order.'});
});
