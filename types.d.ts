import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE, Declarations} from 'be-enhanced/types';
import {Target, Matches, Scope} from 'trans-render/lib/types';

export interface EndUserProps extends IBE<HTMLLinkElement | HTMLMetaElement>{
    prop: string;
    isTwoWay?: boolean;
    hostTarget?: Target;
    hostProp?: string;
}


export interface AllProps extends EndUserProps{
    value?: string | boolean | number;
    isC: boolean;
    hostRef?: WeakRef<EventTarget>;
    transform?: Matches;
    transformWhenTruthy?: Matches;
    transformWhenFalsy?: Matches;
    transformScope?: 
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onValChange(self: this): void;
    hydrate(self: this): void;
    onProp(self: this): PAP;
}