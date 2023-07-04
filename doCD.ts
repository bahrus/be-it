import 'be-switched/be-switched.js';
import {AP} from 'be-switched/types';
export async function doCD(templ: HTMLTemplateElement, val: any){
    const base = await (<any>templ).beEnhanced.whenResolved('be-switched') as AP;
    base.lhs = val;
}