import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/logo-ieb.png" 
            alt="Logo IEB" 
            className={`object-contain ${props.className || ''}`}
        />
    );
}
