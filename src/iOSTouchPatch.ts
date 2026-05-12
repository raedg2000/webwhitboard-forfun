// iOS-only patch.
//
// Problem: Safari on iOS/iPadOS returns 0 for PointerEvent.movementX / movementY
// when pointerType is 'touch' or 'pen'. The rest of the codebase reads those
// values to translate rulers, the compass, set-square, protractor, etc.
//
// Fix (scoped to iOS so no other platform is affected):
//   1. Detect iOS / iPadOS.
//   2. Install capture-phase pointer listeners that compute the delta from the
//      previous clientX/clientY for the same pointerId.
//   3. Override the movementX / movementY getters on MouseEvent.prototype so
//      every consumer transparently gets the correct value. Mouse events keep
//      their native getter as a fallback.
//
// This file has no exports and runs once at import time.

function isIOS(): boolean {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) {
        return true;
    }
    // iPadOS 13+ identifies as MacIntel; touch points distinguish it from a Mac.
    if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1) {
        return true;
    }
    return false;
}

if (isIOS()) {
    const lastPos = new Map<number, { x: number; y: number }>();
    const deltas = new WeakMap<Event, { dx: number; dy: number }>();

    const track = (event: Event) => {
        const e = event as PointerEvent;
        if (typeof e.pointerId !== 'number') {
            return;
        }
        const prev = lastPos.get(e.pointerId);
        const dx = prev ? e.clientX - prev.x : 0;
        const dy = prev ? e.clientY - prev.y : 0;
        deltas.set(e, { dx, dy });
        lastPos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };

    const forget = (event: Event) => {
        const e = event as PointerEvent;
        if (typeof e.pointerId === 'number') {
            lastPos.delete(e.pointerId);
        }
    };

    // Capture phase + passive:false so we see every event before user handlers
    // and never block their preventDefault calls.
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('pointerdown', track, opts);
    window.addEventListener('pointermove', track, opts);
    window.addEventListener('pointerup', forget, opts);
    window.addEventListener('pointercancel', forget, opts);

    const nativeMovementX = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'movementX')?.get;
    const nativeMovementY = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'movementY')?.get;

    const makeGetter = (axis: 'dx' | 'dy', nativeGetter: (() => number) | undefined) => {
        return function (this: MouseEvent): number {
            // PointerEvent inherits from MouseEvent. For non-pointer or mouse
            // pointer types, defer to the browser's native value when available.
            const asPointer = this as PointerEvent;
            const isPointer = typeof (asPointer as any).pointerId === 'number';
            if (isPointer && asPointer.pointerType !== 'mouse') {
                const d = deltas.get(this);
                if (d) {
                    return axis === 'dx' ? d.dx : d.dy;
                }
                return 0;
            }
            return nativeGetter ? nativeGetter.call(this) : 0;
        };
    };

    Object.defineProperty(MouseEvent.prototype, 'movementX', {
        configurable: true,
        get: makeGetter('dx', nativeMovementX),
    });
    Object.defineProperty(MouseEvent.prototype, 'movementY', {
        configurable: true,
        get: makeGetter('dy', nativeMovementY),
    });
}
