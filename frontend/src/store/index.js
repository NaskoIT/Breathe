import { createStore, persist } from 'easy-peasy';
import models from './models';

const store = createStore(
    persist(models, {
        storage: 'localStorage',
    }),
    {
        version: 1,
        devTools: true,
    }
);

/**
 * FOR HOT RELOADING
 */
if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
        module.hot.accept('./models', () => {
            store.reconfigure(models);
        });
    }
}

export default store;