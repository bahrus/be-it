import {AllProps} from './types';
export async function setProp(target: Element, prop: string, value: any, self: AllProps){
    if(target instanceof HTMLTemplateElement && prop === 'content-display'){
        const {doCD} = await import('./doCD.js');
        doCD(target, value);
    }else{
        const {translateBy} = self;
        let newVal = value;
        if(translateBy !== undefined){
            newVal = Number(newVal) + translateBy;
        }                    
        if(prop === 'value' && target instanceof HTMLInputElement && self.adjustInputType !== false){
            target.readOnly = typeof newVal === 'object';
            switch(typeof newVal){
                case 'number':
                    target.type = 'number';
                    target.valueAsNumber = newVal;
                    break;
                case 'boolean':
                    target.type = 'checkbox';
                    target.checked = newVal;
                    break;
                case 'object':
                    //TODO:  date
                    target.type = 'text';
                    target.value = toString(newVal, 40);
                    break;
                case 'string':
                    target.type = 'text';
                    target.value = newVal;
                    break;
            }
        }else{
            if(prop[0] === '.'){
                const {setProp} = await import('trans-render/lib/setProp.js');
                setProp(target, prop, newVal);
            }else{
                (<any>target)[prop] = newVal;
            }
        }


    } 
}

function toString(obj: any, max: number){
    let ret = JSON.stringify(obj, null, 2);
    if(ret.length > max * 2){
        ret = ret.substring(0, max) + '...' + ret.substring(ret.length - max);
    }
    return ret;
}