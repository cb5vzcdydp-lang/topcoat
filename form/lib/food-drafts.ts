import {z} from 'zod';
import {portionUnits} from './food-nutrition';

export const foodDraftSchema=z.object({
  format:z.literal(1),kind:z.enum(['meal','recipe']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  id:z.string().min(1).max(100),logId:z.string().min(1).max(100),initialId:z.string().max(100).optional(),baseVersion:z.number().optional(),
  name:z.string().max(120),servings:z.string().max(30),amount:z.string().max(30),category:z.string().max(30),
  items:z.array(z.object({id:z.string().max(100),name:z.string().max(120),reference:z.record(z.unknown()),amount:z.union([z.number(),z.nan()]),unit:z.enum(portionUnits)})).max(40),
});
export type FoodDraft=z.infer<typeof foodDraftSchema>;
export function foodDraftPrefix(uid:string,client:string){return 'food-task:'+encodeURIComponent(uid)+':'+encodeURIComponent(client)+':';}
export function foodDraftKey(uid:string,client:string,kind:'meal'|'recipe',initialId?:string){return foodDraftPrefix(uid,client)+kind+':'+encodeURIComponent(initialId||'new');}
export function hasFoodDraftContent(draft:FoodDraft){return !!draft.name.trim()||draft.items.length>0;}
