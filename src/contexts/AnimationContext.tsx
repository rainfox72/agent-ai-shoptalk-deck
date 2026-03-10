/**
 * Animation gating context for the slide deck.
 *
 * When `animationsEnabled` is true (interactive view), diagram nodes stagger in,
 * bullets reveal progressively, and edges animate with flowing dashes.
 *
 * When false (PDF export), everything renders in its final static state so
 * html-to-image captures complete slides without partial animation artifacts.
 */

import { createContext, useContext } from 'react';

const AnimationContext = createContext(true);

export const AnimationProvider = AnimationContext.Provider;
export const useAnimationsEnabled = () => useContext(AnimationContext);
