module.exports=({config:base})=>{
 const healthEnabled=process.env.FORM_HEALTH_ENABLED==='1';
 return {...base,extra:{healthEnabled},ios:{...base.ios,entitlements:healthEnabled?{'com.apple.developer.healthkit':true}:{},infoPlist:{...base.ios.infoPlist,...(!healthEnabled?{NSHealthShareUsageDescription:undefined,NSHealthUpdateUsageDescription:undefined}:{})}},plugins:[...base.plugins.filter(plugin=>(Array.isArray(plugin)?plugin[0]:plugin)!=='@kingstinct/react-native-healthkit'),...(healthEnabled?[["@kingstinct/react-native-healthkit",{NSHealthShareUsageDescription:'Form reads only health data you approve and sync explicitly to your Form profile.',NSHealthUpdateUsageDescription:false,background:false}]]:[])]};
};
