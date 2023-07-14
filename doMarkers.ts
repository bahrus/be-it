import {AllProps, Syndication} from './types';
import {lispToCamel} from 'trans-render/lib/lispToCamel.js';
import {setProp} from './setProp.js';

const wm = new WeakMap<Element, Syndication[]>();

export async function doMarkers(self: AllProps){
    requestIdleCallback(() => {
    const {value, markers, enhancedElement} = self;
        let syndications = wm.get(enhancedElement);
        if(syndications === undefined){
            
                const parentElement = enhancedElement.parentElement;
                syndications = [];
                if(parentElement === null) throw 'NI';
                for(const marker of markers!){
                    const targets = Array.from(parentElement?.querySelectorAll(`[${marker}]`));
                    const lispProp = marker.substring(1);
                    const syndication = {
                        prop: lispToCamel(lispProp),
                        refs: targets.map(t => new WeakRef(t)),
                    } as Syndication;
                    syndications.push(syndication);
                }
                wm.set(enhancedElement, syndications);
            

        }
        for(const syndication of syndications!){
            const {refs, prop} = syndication;
            for(const ref of refs){
                const el = ref.deref();
                if(el !== undefined){
                    setProp(el, prop, value, self);
                }
            }
        }
    })
}