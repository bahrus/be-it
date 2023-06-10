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
    #ignoreValChange = false;
    get #attr() {
        return this.enhancedElement.localName === 'link' ? 'href' : 'content';
    }
    async attach(enhancedElement, enhancementInfo) {
        await super.attach(enhancedElement, enhancementInfo);
        const mutOptions = {
            attributeFilter: [this.#attr],
            attributes: true
        };
        this.#mutationObserver = new MutationObserver(() => {
            if (this.#ignoreValChange) {
                this.#ignoreValChange = false;
                return;
            }
            this.calcVal();
        });
        this.#mutationObserver.observe(enhancedElement, mutOptions);
        this.calcVal();
    }
    calcVal() {
        const { enhancedElement } = this;
        if (!enhancedElement.hasAttribute(this.#attr)) {
            this.value = undefined;
            this.resolved = true;
            return;
        }
        if (enhancedElement instanceof HTMLMetaElement) {
            const type = enhancedElement.getAttribute('itemtype');
            const content = enhancedElement.content;
            switch (type) {
                case 'https://schema.org/Number':
                    this.value = Number(content);
                    break;
                case 'https://schema.org/Integer':
                    this.value = parseInt(content);
                    break;
                case 'https://schema.org/Float':
                    this.value = parseFloat(content);
                    break;
            }
        }
        else {
            const split = (enhancedElement.href).split('/');
            const lastVal = split.at(-1);
            this.#ignoreValChange = true;
            switch (lastVal) {
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
        this.resolved = true;
    }
    detach(detachedElement) {
        if (this.#mutationObserver !== undefined)
            this.#mutationObserver.disconnect();
    }
    onValChange(self) {
        const { value, enhancedElement, prop } = self;
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
        if (prop) {
            const target = this.#target;
            if (target !== null)
                target[prop] = value;
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
            }
        }
    },
    superclass: BeIt
});
register(ifWantsToBe, upgrade, tagName);
