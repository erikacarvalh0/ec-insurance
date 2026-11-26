import { createElement as h } from 'react';
import { Button as UpstreamButton } from '@erikacarvalho/react/Button';
export function EcdsButton({type='button',disabled,onClick,children,className,...rest}){
 if(Object.keys(rest).length) return h('button',{...rest,type,disabled,onClick,className},children);
 return h(UpstreamButton,{type,isDisabled:disabled,action:onClick??(()=>{}),customClass:className},children);
}
