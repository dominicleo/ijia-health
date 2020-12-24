import * as React from 'react';

import Container, { ContainerConstructor } from './container';
import { StateContextConsumer, StateContextProvider } from './context';

export type ProviderProps = {
  inject?: Array<Container<any>>;
  children: React.ReactNode;
};

const Provider: React.FC<ProviderProps> = ({ inject, children }) => {
  return (
    <StateContextConsumer>
      {(map) => {
        let childrenMap: Map<ContainerConstructor<any>, Container<any>>;

        if (map === null) {
          childrenMap = new Map();
        } else {
          childrenMap = map;
        }

        if (inject) {
          inject.forEach((instance) => {
            childrenMap.set(instance.constructor as ContainerConstructor<any>, instance);
          });
        }

        return <StateContextProvider value={childrenMap}>{children}</StateContextProvider>;
      }}
    </StateContextConsumer>
  );
};

export default Provider;
