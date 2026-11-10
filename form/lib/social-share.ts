import {z} from 'zod';

const httpsUrl=z.string().trim().max(500).refine(value=>!value||(()=>{try{return new URL(value).protocol==='https:'}catch{return false}})(),'Use a valid https:// link.').default('');
const macro=z.number().finite().nonnegative().max(100000);
export const socialShareSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('recipe'),title:z.string().trim().min(1).max(100),servings:z.number().positive().max(1000),calories:macro,protein:macro,carbs:macro,fat:macro,ingredients:z.array(z.object({name:z.string().trim().min(1).max(100),grams:z.number().finite().nonnegative().max(100000)})).max(40)}),
 z.object({type:z.literal('workout_template'),title:z.string().trim().min(1).max(100),exercises:z.array(z.object({name:z.string().trim().min(1).max(100),sets:z.number().int().min(1).max(20),min:z.number().int().min(0).max(1000),max:z.number().int().min(0).max(1000)})).min(1).max(30)}),
 z.object({type:z.literal('song'),title:z.string().trim().min(1).max(120),artist:z.string().trim().min(1).max(120),url:httpsUrl}),
 z.object({type:z.literal('recommendation'),title:z.string().trim().min(1).max(120),description:z.string().trim().max(500).default(''),url:httpsUrl}),
]);
export type SocialShare=z.infer<typeof socialShareSchema>;
