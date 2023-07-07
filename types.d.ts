import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE, Declarations} from 'be-enhanced/types';
import {Target, Matches, Scope} from 'trans-render/lib/types';

export interface EndUserProps extends IBE<HTMLLinkElement | HTMLMetaElement>{
    prop: string;
    isTwoWay?: boolean;
    hostTarget?: Target;
    hostProp?: string;
    translateBy?: number;
    transform?: Matches; //TODO
    transformWhenTruthy?: Matches; //TODO
    transformWhenFalsy?: Matches; //TODO
    transformScope?: Scope; //TODO
    domNav?: 'nextElementSibling' | 'parentElement' | 'previousElementSibling';
}


export interface AllProps extends EndUserProps{
    value?: string | boolean | number;
    isC: boolean;
    hostRef?: WeakRef<EventTarget>;

}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onValChange(self: this): ProPAP;
    hydrate(self: this): void;
    onProp(self: this): PAP;
}