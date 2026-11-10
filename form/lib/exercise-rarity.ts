export type PushupReferenceGroup='male'|'female';

// Percentile thresholds for the standardized revised push-up test. Male values
// use the pooled 595-student sample; female values use the 216-student sample.
// Mozumdar, Liguori & Baumgartner (2010), DOI: 10.1080/10913670903484835.
const thresholds:Record<PushupReferenceGroup,Array<[number,number]>>={
 male:[[5,4],[10,10],[15,13],[20,15],[25,16],[30,18],[35,20],[40,20],[45,21],[50,23],[55,25],[60,26],[65,28],[70,29],[75,30],[80,32],[85,35],[90,38],[95,42],[100,64]],
 female:[[5,1],[10,2],[15,2],[20,3],[25,4],[30,5],[35,6],[40,7],[45,8],[50,9],[55,10],[60,10],[65,11],[70,13],[75,14],[80,15],[85,16],[90,20],[95,20],[100,26]],
};

export function revisedPushupEstimate(reps:number,group:PushupReferenceGroup){
 const value=Math.max(0,Math.floor(Number.isFinite(reps)?reps:0));
 if(value===0)return {reps:value,percentile:0,capablePercent:100,sampleSize:group==='male'?595:216};
 const rows=thresholds[group];
 let percentile=0;
 for(const [rank,score] of rows)if(value>=score)percentile=Math.max(percentile,rank);
 const capablePercent=Math.max(1,Math.min(100,100-percentile));
 return {reps:value,percentile,capablePercent,sampleSize:group==='male'?595:216};
}

export const revisedPushupSource={
 title:'Additional Revised Push-Up Test Norms for College Students',
 href:'https://doi.org/10.1080/10913670903484835',
 year:2010,
};
