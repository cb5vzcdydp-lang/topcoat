export type HenryMessage={id:string;role:'user'|'assistant';content:string;created:string};
export type HenryConversation={id:string;title:string;messages:HenryMessage[];created:string;updated:string;version:number};
export type HenrySummary=Omit<HenryConversation,'messages'>;
export type HenrySnapshot={configured:boolean;conversations:HenrySummary[];conversation:HenryConversation|null;memory:string;memoryVersion:number};
export const henrySuggestions=[
 {icon:'calendar',text:'Give me a weekly training overview'},
 {icon:'trend',text:'Show me my recent exercise history'},
 {icon:'scale',text:'Analyse my recent weight trend'},
 {icon:'heart',text:'What do my recovery metrics look like?'},
 {icon:'history',text:'How was my last training session?'},
] as const;
export function conversationAge(value:string,now=Date.now()){
 const days=Math.max(0,Math.floor((now-new Date(value).getTime())/86400000));
 if(!Number.isFinite(days))return '';if(days===0)return 'Today';if(days===1)return 'Yesterday';return `${days} days ago`;
}
