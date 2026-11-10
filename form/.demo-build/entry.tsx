import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../app/page';
(window as any).__FORM_DEMO_ONLY__=true;
document.addEventListener('click',e=>{const a=(e.target as Element).closest('a');if(a?.getAttribute('href')?.startsWith('/signin')||a?.getAttribute('href')?.startsWith('/signout')){e.preventDefault();alert('This is the standalone demo. Cloud sign-in and real client accounts are available only after the backend is hosted.');}if(a?.getAttribute('href')==='/'){e.preventDefault();location.reload();}});
createRoot(document.getElementById('root')!).render(<App/>);

const fallback=document.getElementById("preview-fallback");if(fallback)fallback.style.display="none";
