import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE, Declarations} from 'be-enhanced/types';

export interface EndUserProps extends IBE<HTMLLinkElement | HTMLMetaElement>{
    
}


export interface AllProps extends EndUserProps{
    value?: string | boolean;
    //ignoreValChange: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onValChange(self: this): void;
    
}