export type RoutePoint={lat:number;lon:number;time?:string;elevation?:number};
export function haversine(a:RoutePoint,b:RoutePoint){const rad=(v:number)=>v*Math.PI/180,p1=rad(a.lat),p2=rad(b.lat),dlat=p2-p1,dlon=rad(b.lon-a.lon),x=Math.sin(dlat/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dlon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(Math.max(0,1-x)))}
export function routeDistance(points:RoutePoint[]){return points.reduce((total,p,i)=>total+(i?haversine(points[i-1],p):0),0)}
export function trimRoute(points:RoutePoint[],metres:number){if(metres<=0)return points;const lengths=points.map((p,i)=>i?haversine(points[i-1],p):0);let total=lengths.reduce((a,v)=>a+v,0),c=0;return points.filter((_,i)=>{c+=lengths[i];return c>=metres&&c<=total-metres})}
export function pace(distanceKm:number,seconds:number,unit:'km/h'|'min/km'|'min/mi'){if(!(distanceKm>0&&seconds>0))return null;return unit==='km/h'?distanceKm/seconds*3600:seconds/60/distanceKm*(unit==='min/mi'?1.609344:1)}
