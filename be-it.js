import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
export class BeIt extends BE {
    #mutationObserver;
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
            this.calcVal();
        });
        this.#mutationObserver.observe(enhancedElement, mutOptions);
        this.calcVal();
    }
    calcVal() {
        const { enhancedElement } = this;
        if (!enhancedElement.hasAttribute(this.#attr)) {
            this.value = undefined;
            return;
        }
        const { localName } = enhancedElement;
        switch (localName) {
            case 'link':
                {
                    const split = (enhancedElement.getAttribute(this.#attr)).split('/');
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
                break;
            case 'meta':
                {
                    const content = enhancedElement.content;
                }
                break;
        }
        this.resolved = true;
    }
    detach(detachedElement) {
        if (this.#mutationObserver !== undefined)
            this.#mutationObserver.disconnect();
    }
    onValChange(self) {
        if (this.#ignoreValChange) {
            this.#ignoreValChange = false;
            return;
        }
        const { value, enhancedElement } = self;
        if (value === undefined)
            return;
        const urlVal = value === true ? 'True' :
            value === false ? 'False' : value;
        enhancedElement.href = 'https://schema.org/' + urlVal;
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
