import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
export class BeIt extends BE {
    static get beConfig() {
        return {
            parse: true,
            primaryProp: 'prop'
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
        const { enhancedElement } = this;
        let { nextElementSibling } = enhancedElement;
        while (nextElementSibling !== null) {
            const { localName } = nextElementSibling;
            if (localName === 'meta' || localName === 'link') {
                nextElementSibling = nextElementSibling.nextElementSibling;
            }
            else {
                this.#targetEl = new WeakRef(nextElementSibling);
                return nextElementSibling;
            }
        }
        return null;
    }
    #skipParsingAttrChange = false;
    get #attr() {
        return this.enhancedElement.localName === 'link' ? 'href' : 'content';
    }
    async hydrate(self) {
        const { enhancedElement, isTwoWay } = self;
        if (isTwoWay) {
            const target = this.#target;
            if (target === null)
                throw 404;
            const { doTwoWay } = await import('./doTwoWay.js');
            doTwoWay(self, target);
            return;
        }
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
        self.calcVal(self);
    }
    calcVal(self) {
        const { enhancedElement, prop } = self;
        if (!enhancedElement.hasAttribute(this.#attr)) {
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
        self.resolved = true;
    }
    detach(detachedElement) {
        if (this.#mutationObserver !== undefined)
            this.#mutationObserver.disconnect();
    }
    onValChange(self) {
        const { value, enhancedElement, prop, isTwoWay } = self;
        if (value === undefined)
            return;
        if (enhancedElement instanceof HTMLMetaElement) {
            enhancedElement.content = value.toString();
        }
        else {
            const urlVal = value === true ? 'True' :
                value === false ? 'False' : value;
            enhancedElement.href = 'https://schema.org/' + urlVal;
        }
        if (prop && !isTwoWay) {
            const target = this.#target;
            if (target !== null)
                target[prop] = value;
        }
    }
    onProp(self) {
        const { prop } = self;
        const split = prop.split('🔃');
        if (split.length === 2) {
            return {
                prop: split[0],
                hostProp: split[1],
                isTwoWay: true,
            };
        }
        else {
            return {};
        }
    }
}
const tagName = 'be-it';
const ifWantsToBe = 'it';
const upgrade = 'link,meta';
const xe = new XE({
    config: {
        tagName,
        propDefaults: {
            ...propDefaults,
            prop: '',
            hostProp: '',
            isC: true,
            hostTarget: 'hostish',
            isTwoWay: false,
        },
        propInfo: {
            ...propInfo,
            value: {
                notify: {
                    dispatch: true,
                }
            }
        },
        actions: {
            onValChange: {
                ifKeyIn: ['value'],
            },
            hydrate: 'isC'
        }
    },
    superclass: BeIt
});
register(ifWantsToBe, upgrade, tagName);
