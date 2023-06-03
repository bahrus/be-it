import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { BEConfig, EnhancementInfo } from 'be-enhanced/types';
import { XE } from 'xtal-element/XE.js';
import { Actions, AllProps, AP, PAP, ProPAP } from './types';
import { register } from 'be-hive/register.js';

export class BeIt extends BE<AP, Actions, HTMLLinkElement | HTMLMetaElement> implements Actions{
    #mutationObserver: MutationObserver | undefined;
    #ignoreValChange = false;

    get #attr(){
        return this.enhancedElement.localName === 'link' ? 'href' : 'content';
    }
    override async attach(enhancedElement: HTMLLinkElement | HTMLMetaElement, enhancementInfo: EnhancementInfo): Promise<void> {
        await super.attach(enhancedElement, enhancementInfo);
        const mutOptions: MutationObserverInit = {
            attributeFilter: [this.#attr],
            attributes: true
        };
        this.#mutationObserver = new MutationObserver(() => {
            this.calcVal();
        });
        this.#mutationObserver.observe(enhancedElement, mutOptions);
        this.calcVal();
    }
    calcVal(){
        const {enhancedElement} = this;
        if(!enhancedElement.hasAttribute(this.#attr)){
            this.value = undefined;
            return;
        }
        const {localName} = enhancedElement;
        switch(localName){
            case 'link':{
                const split = (enhancedElement.getAttribute(this.#attr)!).split('/');
                const lastVal = split.at(-1);
                this.#ignoreValChange = true;
                switch(lastVal){
                    case 'True':
                        this.value = true;
                        break;
                    case 'False':
                        this.value = false;
                        break;
                    default:
                        this.value = lastVal;
                }
                
            }
            break;
            case 'meta':{
                const content = (enhancedElement as HTMLMetaElement).content;
                
            }
            break;
        }

        this.resolved = true;
    }
    override detach(detachedElement: HTMLLinkElement) {
        if(this.#mutationObserver !== undefined) this.#mutationObserver.disconnect();
    }

    onValChange(self: this): void {
        if(this.#ignoreValChange){
            this.#ignoreValChange = false;
            return;
        }
        const {value, enhancedElement} = self;
        if(value === undefined) return;
        const urlVal = value === true ? 'True' :
            value === false ? 'False' : value;
        enhancedElement.href = 'https://schema.org/' + urlVal;
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
        },
        propInfo: {
            ...propInfo,
            value: {
                notify:{
                    dispatch: true,
                }
            }
        },
        actions: {
            onValChange: {
                ifKeyIn: ['value'],
            }
        }
    },
    superclass: BeIt
});

register(ifWantsToBe, upgrade, tagName);