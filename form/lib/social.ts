export const socialChallengeMetrics={
 bodyfat_relative_drop:{label:'Body-fat reduction',shortLabel:'Body fat',unit:'%',direction:'down',max:70,placeholder:'Starting body fat %'},
 weight_relative_drop:{label:'Body-weight reduction',shortLabel:'Body weight',unit:'kg',direction:'down',max:500,placeholder:'Starting body weight (kg)'},
 bench_relative_gain:{label:'Bench press strength',shortLabel:'Bench press',unit:'kg',direction:'up',max:1000,placeholder:'Starting bench press (kg)'},
 squat_relative_gain:{label:'Squat strength',shortLabel:'Squat',unit:'kg',direction:'up',max:1200,placeholder:'Starting squat (kg)'},
 deadlift_relative_gain:{label:'Deadlift strength',shortLabel:'Deadlift',unit:'kg',direction:'up',max:1200,placeholder:'Starting deadlift (kg)'},
 pushup_relative_gain:{label:'Push-up capacity',shortLabel:'Push-ups',unit:'reps',direction:'up',max:1000,placeholder:'Starting max push-ups'},
 pullup_relative_gain:{label:'Pull-up capacity',shortLabel:'Pull-ups',unit:'reps',direction:'up',max:500,placeholder:'Starting max pull-ups'},
 workouts_relative_gain:{label:'Weekly workout consistency',shortLabel:'Weekly workouts',unit:'sessions',direction:'up',max:100,placeholder:'Starting workouts per week'},
 steps_relative_gain:{label:'Daily step average',shortLabel:'Daily steps',unit:'steps',direction:'up',max:200000,placeholder:'Starting daily step average'},
} as const;
export type SocialChallengeMetric=keyof typeof socialChallengeMetrics;
/** Scores change proportionally to each participant's own baseline. */
export function relativeChallengeScore(metric:SocialChallengeMetric,baseline:number,current:number):number|null{
 if(!Number.isFinite(baseline)||!Number.isFinite(current)||baseline<=0)return null;
 return socialChallengeMetrics[metric].direction==='down'?(baseline-current)/baseline*100:(current-baseline)/baseline*100;
}
export function challengeRank(score:number|null){
 if(score==null)return {label:'Unranked',level:0};
 if(score>=25)return {label:'Form Elite',level:5};
 if(score>=15)return {label:'Diamond',level:4};
 if(score>=8)return {label:'Gold',level:3};
 if(score>=3)return {label:'Silver',level:2};
 return {label:'Bronze',level:1};
}

export function averageChallengeRank(scores:Array<number|null|undefined>){
 const values=scores.filter((score):score is number=>typeof score==='number'&&Number.isFinite(score));
 const average=values.length?values.reduce((sum,score)=>sum+score,0)/values.length:null;
 return {...challengeRank(average),averageScore:average,rankCount:values.length};
}

export function sharedWorkoutStatus(lastSharedWorkout:string|null|undefined,now=Date.now(),slackingAfterDays=7){
 const timestamp=lastSharedWorkout?Date.parse(lastSharedWorkout):NaN;
 if(!Number.isFinite(timestamp))return {slacking:true,daysSince:null,activityLabel:'No shared workouts yet'};
 const daysSince=Math.max(0,Math.floor((now-timestamp)/86_400_000));
 return {slacking:daysSince>=slackingAfterDays,daysSince,activityLabel:daysSince===0?'Shared today':daysSince===1?'Shared yesterday':`Shared ${daysSince} days ago`};
}

/** Lifecycle labels shared by challenge filters and cards. Dates are local diary days. */
export function challengeState(challenge:{status:string;starts:string;ends:string},today:string){
 if(challenge.status==='left')return 'left';
 if(challenge.ends<today)return 'complete';
 if(challenge.status==='invited')return 'invited';
 if(challenge.starts>today)return 'scheduled';
 return 'active';
}

export function relativeChallengeRules(metric:SocialChallengeMetric,starts:string,ends:string){const down=socialChallengeMetrics[metric].direction==='down';return `Dates: ${starts} to ${ends} (UTC), inclusive. Invited accepted friends may join until the end date. Updates are accepted only during these dates. Score = ${down?'(baseline − current)':'(current − baseline)'} ÷ baseline × 100. Baselines must be positive; permitted ranges depend on the chosen metric. Values are self-reported; agree on the same measurement method. Equal scores share their place (1, 1, 3); no update means no place. Leaving removes the score. This compares progress in this one measure, not overall fitness.`;}
export function relativeChallengePlace(rows:{score:number|null}[],score:number|null){return score==null?null:1+rows.filter(row=>row.score!=null&&row.score>score+1e-7).length;}
