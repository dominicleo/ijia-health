import * as React from 'react';

import Container, { ContainerConstructor } from './Container';

export type ContainerInjectMap<State> = Map<ContainerConstructor<State>, Container<State>> | null;

export const StateContext = React.createContext<ContainerInjectMap<any>>(null);
export const StateContextConsumer = StateContext.Consumer;
export const StateContextProvider = StateContext.Provider;
