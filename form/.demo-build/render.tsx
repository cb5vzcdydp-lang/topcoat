import React from 'react';
import {renderToString} from 'react-dom/server';
import App from '../app/page';
export default function render(){(globalThis as any).__FORM_DEMO_ONLY__=true;return renderToString(<App/>)}
