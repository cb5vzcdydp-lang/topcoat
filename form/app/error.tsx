'use client';
export default function ErrorPage({reset}:{reset:()=>void}){
 return <main className="connection-state panel" role="alert"><h1>Form couldn’t open this view.</h1><p>Your saved records are still on the server. Try the view again, or reload the app.</p><button className="btn primary" onClick={reset}>Try again</button><button className="btn" onClick={()=>location.reload()}>Reload</button></main>;
}
