import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga';
import createSaga from "./createSaga"

export default function({models}): object {
    const initSaga = createSaga(models)
    const rootSaga = initSaga.createEffects
    const reducers = initSaga.createReducers()
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(
        combineReducers(reducers),
        applyMiddleware(sagaMiddleware)
    )
    sagaMiddleware.run(rootSaga.bind(initSaga))
    return store;
}


