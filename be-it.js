import { BE, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
const cache = new Map();
export class BeIt extends BE {
    static get beConfig() {
        return {
            parse: true,
            primaryProp: 'prop',
            cache,
        };
    }
    #mutationObserver;
    #targetEl;
    get #target() {
        if (this.#targetEl !== undefined) {
            const deref = this.#targetEl.deref();
            if (deref !== undefined)
                return deref;
        }
        const { enhancedElement, targetRel } = this;
        let peer = enhancedElement[targetRel || 'nextElementSibling'];
        while (peer !== null) {
            const { localName } = peer;
            if (localName === 'meta' || localName === 'link') {
                peer = peer[targetRel || 'nextElementSibling'];
            }
            else {
                this.#targetEl = new WeakRef(peer);
                return peer;
            }
        }
        return null;
    }
    #skipParsingAttrChange = false;
    get #attr() {
        return this.enhancedElement.localName === 'link' ? 'href' : 'content';
    }
    async hydrate(self) {
        const { enhancedElement, isTwoWay, observeAttr, deriveFromSSR } = self;
        //if(enhancedElement.classList.contains('ignore')) return;
        if (isTwoWay) {
            const target = this.#target;
            if (target === null)
                throw 404;
            const { doTwoWay } = await import('./doTwoWay.js');
            doTwoWay(self, target);
        }
        if (observeAttr) {
            const mutOptions = {
                attributeFilter: [self.#attr],
                attributes: true
            };
            self.#mutationObserver = new MutationObserver(( /*mutations: MutationRecord[]*/) => {
                //const [mutation] = mutations;
                //if(mutation.oldValue === self.getAttribute(this.#attr)) return;
                if (self.#skipParsingAttrChange) {
                    self.#skipParsingAttrChange = false;
                    return;
                }
                self.calcVal(self);
            });
            self.#mutationObserver.observe(enhancedElement, mutOptions);
        }
        if (deriveFromSSR) {
            self.calcVal(self);
        }
        else {
            self.resolved = true;
        }
    }
    calcVal(self) {
        //console.log('calcVal');
        const { enhancedElement, prop, isTwoWay } = self;
        if (prop && !isTwoWay && !enhancedElement.hasAttribute(this.#attr)) {
            //see if target element has a value
            const target = this.#target;
            if (target !== null) {
                this.#skipParsingAttrChange = true;
                self.value = target[prop];
            }
            else {
                self.value = undefined;
            }
            self.resolved = true;
            return;
        }
        this.#skipSettingAttr = true;
        if (enhancedElement instanceof HTMLMetaElement) {
            const type = enhancedElement.getAttribute('itemtype');
            const content = enhancedElement.content;
            switch (type) {
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
        }
        else {
            const split = (enhancedElement.href).split('/');
            const lastVal = split.at(-1);
            self.#skipParsingAttrChange = true;
            switch (lastVal) {
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
    detach(detachedElement) {
        if (this.#mutationObserver !== undefined)
            this.#mutationObserver.disconnect();
    }
    #skipSettingAttr = false;
    async onValChange(self) {
        const { value, enhancedElement, prop, isTwoWay } = self;
        //if(enhancedElement.classList.contains('ignore')) return {resolved: true};
        if (value === undefined || value === null)
            return {};
        if (!this.#skipSettingAttr) {
            if (enhancedElement instanceof HTMLMetaElement) {
                enhancedElement.content = value.toString();
            }
            else {
                const urlVal = value === true ? 'True' :
                    value === false ? 'False' : value;
                enhancedElement.href = 'https://schema.org/' + urlVal;
            }
        }
        this.#skipSettingAttr = false;
        if (prop && !isTwoWay) {
            const target = this.#target;
            if (target !== null) {
                if (target instanceof HTMLTemplateElement && prop === 'content-display') {
                    const { doCD } = await import('./doCD.js');
                    doCD(target, value);
                }
                else {
                    const { translateBy } = self;
                    let newVal = value;
                    if (translateBy !== undefined) {
                        newVal = Number(newVal) + translateBy;
                    }
                    if (prop[0] === '.') {
                        const { setProp } = await import('trans-render/lib/setProp.js');
                        setProp(target, prop, newVal);
                    }
                    else {
                        target[prop] = newVal;
                    }
                }
            }
        }
        return {
            resolved: true
        };
    }
    onProp(self) {
        let { prop, deriveFromSSR, enhancedElement } = self;
        if (prop === undefined) {
            console.log('undefined');
            return {};
        }
        if (!deriveFromSSR) {
            //const {enh} = enhancementInfo;
            //const attr = enhancedElement.getAttribute('be-it');
            if (prop.endsWith('🌩️')) {
                self.deriveFromSSR = true;
                const newStr = prop.substring(0, prop.length - 3);
                if (enhancedElement.hasAttribute('be-it')) {
                    self.deriveFromSSR = true;
                }
                enhancedElement.setAttribute('be-it', newStr);
                self.prop = newStr;
                return {};
            }
        }
        const split = prop.split('🔃');
        if (split.length === 2) {
            return {
                prop: split[0],
                hostProp: split[1],
                isTwoWay: true,
                isC: true,
            };
        }
        else {
            return {
                isC: true
            };
        }
    }
}
const tagName = 'be-it';
const ifWantsToBe = 'it';
const upgrade = 'link,meta';
const xe = new XE({
    config: {
        tagName,
        isEnh: true,
        propDefaults: {
        //...propDefaults,
        //isC: false,
        //prop: '',
        },
        propInfo: {
            ...propInfo,
            prop: {
                type: 'String'
            },
            isTwoWay: {
                type: 'Boolean'
            },
            value: {
                notify: {
                    dispatch: true,
                }
            },
            translateBy: {
                type: 'Number'
            },
            targetRel: {
                type: 'String',
            },
            hostTarget: {
                type: 'String',
            },
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
