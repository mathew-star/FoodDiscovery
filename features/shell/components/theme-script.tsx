import { themeCookie } from '@/shared/config/site';

const source = `(function(){try{var m=document.cookie.match(/(?:^|; )${themeCookie}=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
