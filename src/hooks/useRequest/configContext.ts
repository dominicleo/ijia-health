import React from 'react';

import { Options } from './types';

type Config = Options<any, any, any, any>;

const ConfigContext = React.createContext<Config>({});
ConfigContext.displayName = 'UseRequestConfigContext';

export default ConfigContext;
