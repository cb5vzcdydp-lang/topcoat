import {z} from 'zod';
import {shiftDate} from './domain';
export const walkRunWeekSchema=z.object({name:z.string().trim().min(1).max(80),rounds:z.number().int().min(1).max(50),run:z.number().int().min(1).max(3600),walk:z.number().int().min(0).max(3600)});
export const walkRunScheduleSchema=z.array(walkRunWeekSchema).min(1).max(16);
export function walkRunSchedule(start:string,daysPerWeek:number,weeks:z.infer<typeof walkRunScheduleSchema>){if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||new Date(start+'T12:00Z').toISOString().slice(0,10)!==start)throw new Error('Choose a valid start date.');if(!Number.isInteger(daysPerWeek)||daysPerWeek<1||daysPerWeek>7)throw new Error('Choose 1–7 sessions per week.');return walkRunScheduleSchema.parse(weeks).flatMap((week,index)=>Array.from({length:daysPerWeek},(_,session)=>({...week,week:index+1,session:session+1,date:shiftDate(start,index*7+Math.floor(session*7/daysPerWeek)),key:(index+1)+':'+(session+1)})));}
