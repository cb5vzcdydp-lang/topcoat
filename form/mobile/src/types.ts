export type Reading={id:string;date:string;metric:'vo2'|'hrv'|'rhr'|'steps'|'weight'|'sleep_duration'|'active_calories'|'total_calories';value:number;unit:string;source:string};
export type Provider={requestPermissions:()=>Promise<void>;readRecent:()=>Promise<Reading[]>};
