import 'be-switched/be-switched.js';
export async function doCD(templ, val) {
    const base = await templ.beEnhanced.whenResolved('be-switched');
    base.lhs = val;
}
