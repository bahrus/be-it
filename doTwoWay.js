export async function doTwoWay(self, targetEl) {
    const { enhancedElement, hostRef, hostProp, hostTarget, prop } = self;
    let host = null;
    if (host === null) {
        if (hostRef !== undefined) {
            host = hostRef.deref() || null;
        }
    }
    if (host === null) {
        if (hostTarget !== undefined) {
            const { findRealm } = await import('trans-render/lib/findRealm.js');
            host = await findRealm(enhancedElement, hostTarget);
        }
    }
    if (host === null)
        throw 404;
    const derivedHostProp = hostProp || enhancedElement.getAttribute('itemprop');
    const { BoundInstance } = await import('be-bound/BoundInstance.js');
    const bi = new BoundInstance(prop, derivedHostProp, targetEl, host, undefined);
    await bi.init(bi);
    self.resolved = true;
}
