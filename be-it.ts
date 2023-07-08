import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { BEConfig, EnhancementInfo } from 'be-enhanced/types';
import { XE } from 'xtal-element/XE.js';
import { Actions, AllProps, AP, PAP, ProPAP } from './types';
import { register } from 'be-hive/register.js';

export class BeIt extends BE<AP, Actions, HTMLLinkElement | HTMLMetaElement> implements Actions{

    static  override get beConfig(){
        return {
            parse: true,
            primaryProp: 'prop'
        } as BEConfig
    }
    #mutationObserver: MutationObserver | undefined;
    #targetEl: WeakRef<Element> | undefined;
    get #target(){
        if(this.#targetEl !== undefined){
            const deref = this.#targetEl.deref();
            if(deref !== undefined) return deref;
        }
        const {enhancedElement, targetRel} = this;
        let peer = enhancedElement[targetRel || 'nextElementSibling'];
        while(peer !== null){
            const {localName} = peer;
            if(localName === 'meta' || localName === 'link'){
                peer = peer[targetRel || 'nextElementSibling'];
            }else{
                this.#targetEl = new WeakRef(peer);
                return peer;
            }
        }
        return null;
    }
    #skipParsingAttrChange = false;

    get #attr(){
        return this.enhancedElement.localName === 'link' ? 'href' : 'content';
    }

    async hydrate(self: this) {
        const {enhancedElement, isTwoWay, observeAttr} = self;
        //if(enhancedElement.classList.contains('ignore')) return;
        if(isTwoWay){
            const target = this.#target;
            if(target === null) throw 404;
            const {doTwoWay} = await import('./doTwoWay.js');
            doTwoWay(self, target);
        }
        const mutOptions: MutationObserverInit = {
            attributeFilter: [self.#attr],
            attributes: true
        };
        if(observeAttr){
            self.#mutationObserver = new MutationObserver((/*mutations: MutationRecord[]*/) => {
                //const [mutation] = mutations;
                //if(mutation.oldValue === self.getAttribute(this.#attr)) return;
                if(self.#skipParsingAttrChange){
                    self.#skipParsingAttrChange = false;
                    return;
                }
                self.calcVal(self);
            });
            self.#mutationObserver.observe(enhancedElement, mutOptions);
        }

        self.calcVal(self);
    }

    calcVal(self: this){
        const {enhancedElement, prop, isTwoWay} = self;
        if(!isTwoWay && !enhancedElement.hasAttribute(this.#attr)){
            //see if target element has a value
            const target = this.#target;
            if(target !== null){
                this.#skipParsingAttrChange = true;
                self.value = (<any>target)[prop!]
            }else{
                self.value = undefined;
            }
            
            self.resolved = true;
            return;
        }
        if(enhancedElement instanceof HTMLMetaElement){
            const type = enhancedElement.getAttribute('itemtype');
            const content = enhancedElement.content;
            switch(type){
                case 'https://schema.org/Number':
                    self.value = Number(content);
                    break;
                case 'https://schema.org/Integer':
                    self.value = parseInt(content);
                    break;
                case 'https://schema.org/Float':
                    self.value = parseFloat(content);
                    break;
                default:
                    self.value = content;
            }
        }else{
            const split = (enhancedElement.href).split('/');
            const lastVal = split.at(-1);
            self.#skipParsingAttrChange = true;
            switch(lastVal){
                case 'True':
                    self.value = true;
                    break;
                case 'False':
                    self.value = false;
                    break;
                default:
                    self.value = lastVal;
            }
        }

        

        
    }
    override detach(detachedElement: HTMLLinkElement) {
        if(this.#mutationObserver !== undefined) this.#mutationObserver.disconnect();
    }

    async onValChange(self: this): ProPAP{
        const {value, enhancedElement, prop, isTwoWay} = self;
        //if(enhancedElement.classList.contains('ignore')) return {resolved: true};
        if(value === undefined || value === null) return {};
        if(enhancedElement instanceof HTMLMetaElement){
            enhancedElement.content = value.toString();
        }else{
            const urlVal = value === true ? 'True' :
            value === false ? 'False' : value;
            enhancedElement.href = 'https://schema.org/' + urlVal;
        }
        if(prop && !isTwoWay){
            const target = this.#target;
            if(target !== null){
                if(target instanceof HTMLTemplateElement && prop === 'content-display'){
                    const {doCD} = await import('./doCD.js');
                    doCD(target, value);
                }else{
                    const {translateBy} = self;
                    let newVal = value;
                    if(translateBy !== undefined){
                        newVal = Number(newVal) + translateBy;
                    }
                    if(prop[0] === '.'){
                        const {setProp} = await import('trans-render/lib/setProp.js');
                        setProp(target, prop, newVal);
                    }else{
                        (<any>target)[prop] = newVal;
                    }
                    
                } 
            }
            
        }
        return {
            resolved: true
        }
    }

    onProp(self: this): PAP {
        const {prop} = self;
        const split = prop.split('🔃');
        if(split.length === 2){
            return {
                prop: split[0],
                hostProp: split[1],
                isTwoWay: true,
            }
        }else{
            return {
                isC: true
            }
        }
        
    }
}

export interface BeIt extends AllProps{}

const tagName = 'be-it';
const ifWantsToBe = 'it';
const upgrade = 'link,meta';

const xe = new XE<AP, Actions>({
    config: {
        tagName,
        propDefaults: {
            ...propDefaults,
            isC: true,
        },
        propInfo: {
            ...propInfo,
            prop: {
                type: 'String'
            },
            isTwoWay:{
                type: 'Boolean'
            },
            value: {
                notify:{
                    dispatch: true,
                }
            },
            translateBy:{
                type: 'Number'
            },
            targetRel: {
                type: 'String',
            },
            hostTarget: {
                type: 'String',
            }
        },
        actions: {
            onValChange: {
                ifKeyIn: ['value'],
            },
            hydrate: 'isC',
            onProp: {
                ifKeyIn: ['prop']
            }
        }
    },
    superclass: BeIt
});

register(ifWantsToBe, upgrade, tagName);