import * as React from 'react';

import Container, { ContainerConstructor } from './container';
import { ContainerInjectMap, StateContextConsumer } from './context';
import { Listener } from './types.d';

const DUMMY_STATE = {};

interface SubscribeProps<State> {
  to: Array<ContainerConstructor<State> | Container<State>>; // container 的构造器, 或者 container的示例
  children(...instances: Array<Container<State>>): React.ReactNode;
}

type SubscribeState = {};

function Subscribe<State>({ to, children }: SubscribeProps<State>) {
  const [state, updateState] = React.useState<SubscribeState>({});
  const instances = React.useRef<Array<Container<State>>>([]);
  const unmounted = React.useRef(false);

  const setState = React.useCallback(
    (nextState) => updateState((prevState) => Object.assign({}, prevState, nextState)),
    [state],
  );

  const onUpdate: Listener = () => {
    if (!unmounted.current) {
      setState(DUMMY_STATE);
    }
  };

  const unsubscribe = () => {
    instances.current.forEach((container) => {
      container.unsubscribe(onUpdate);
    });
  };

  const createInstances = (
    map: ContainerInjectMap<State>,
    containers: Array<ContainerConstructor<State> | Container<State>>,
  ): Array<Container<State>> => {
    unsubscribe();

    if (map === null) {
      throw new Error('You must wrap your <Subscribe> components with a <Provider>');
    }

    const safeMap = map;

    const next = containers.map((ContainerItem) => {
      let instance;

      if (typeof ContainerItem === 'object' && ContainerItem instanceof Container) {
        instance = ContainerItem;
      } else {
        instance = safeMap.get(ContainerItem);

        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      instance.unsubscribe(onUpdate);
      instance.subscribe(onUpdate);

      return instance;
    });

    instances.current = next;

    return next;
  };

  React.useEffect(
    () => () => {
      unmounted.current = true;
      unsubscribe();
    },
    [],
  );

  return (
    <StateContextConsumer>
      {(map) => children.apply(null, [...createInstances(map, to)])}
    </StateContextConsumer>
  );
}

export default Subscribe;
