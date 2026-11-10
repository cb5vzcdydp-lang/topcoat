import {AppearanceProvider} from './appearance';
import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Form — Coaching, connected',description:'Your clients. Their effort. One clear picture.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppearanceProvider>{children}</AppearanceProvider></body></html>}
