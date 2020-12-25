import { atom } from 'recoil';
import { CHATING_MESSAGEBAR, CHATING_TOOLBAR } from './types.d';

export const keyboardHeightState = atom({
  key: 'KeyboardHeight',
  default: 0,
});

export const valueState = atom({
  key: 'ValueState',
  default: '',
});

export const focusState = atom({
  key: 'FucosState',
  default: false,
});

export const messagebarState = atom<CHATING_MESSAGEBAR>({
  key: 'Messagebar',
  default: CHATING_MESSAGEBAR.KEYBOARD,
});

export const toolbarState = atom<CHATING_TOOLBAR>({
  key: 'Toolbar',
  default: CHATING_TOOLBAR.HIDDEN,
});
