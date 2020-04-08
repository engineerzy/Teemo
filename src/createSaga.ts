import * as reduxSaga from 'redux-saga/effects';
let { put, call, select, take, fork, cancel } = reduxSaga
const sagaPut = put

type IModel = {
    namespace?: string,
    state?: object,
    reducers?: object,
    effect?: object
}
class createSaga {
    private models: Array<IModel> | IModel
    private reducers: object

    constructor(models = []) {
        this.models = models
        this.reducers = {}
    }

    /**
     *检查models是否为数组或对象
     * @memberof createSaga
     */
    checkModels(): void {
        const models_type = Object.prototype.toString.call(this.models)
        if (models_type !== '[object Object]' && models_type !== '[object Array]') {
            throw new Error("请确保传入的模块为数组或模块对象")
        } else if (models_type !== '[object Array]') {
            this.models = [...this.models]
        }
    }

    /**
     *为reducer和effect添加前缀
     *
     * @param {*} model 模块
     * @param {*} type  reducer | effect
     * @returns
     * @memberof createSaga
     */
    moudlePrefix(model: IModel, type: 'reducers' | 'effect' ) {
        if (type !== 'reducers' && type !== 'effect') return;
        const modelProperty = model[type]
        for (const key in modelProperty) {
            if (modelProperty.hasOwnProperty(key)) {
                modelProperty[`${model.namespace}/${key}`] = modelProperty[key]
                Reflect.deleteProperty(modelProperty, key)
            }
        }
        return modelProperty;
    }

    /**
     *改造saga的put方法；
     *将原本的action参数修改为两个
     *第一个参数为dispatch提交的载荷，第二个为redux的各类effect
     * @param {*} namespace 模块名
     * @returns
     * @memberof createSaga
     */
    decoratePut(namespace) {
        put = (action) => {
            const effect_type = action.type.includes('/') ? action.type : namespace + '/' + action.type
            return sagaPut({ ...action, type: effect_type });
        }
    }

    /**
    *生产异步reducer（takeLatest）
    * @param {*} namespace 模块名
    * @param {*} key 异步effect名
    * @param {*} effect 异步操作
    * @returns
    * @memberof createSaga
    */
    takeLatest(namespace, key, effect) {
        const _this = this
        return fork(function* () {
            let lastTask
            while (true) {
                // 获取dispatch 的action参数
                const payload = yield take(key)
                // 如果上已有上一个任务，则取消上一个任务，构建高阶api
                if (lastTask) {
                    yield cancel(lastTask)
                }
                // 改造put方法
                _this.decoratePut(namespace)
                // 删除action中的type参数
                Reflect.deleteProperty(payload, 'type')
                // 获取redux-saga的Task任务
                lastTask = yield fork(effect[key], payload, { put, call, select })
            }
        })
    }

    /**
     *初始化models,生成符合redux-saga要求的saga对象
     *
     * @returns
     * @memberof createSaga
     */
    *createEffects() {
        const _this = this
        for (const model of this.models) {
            _this.moudlePrefix(model, 'effect')
            // 每一个model都生成有个saga
            const { effect, namespace } = model
            for (const key in effect) {
                if (effect.hasOwnProperty(key)) {
                    yield function () {
                        return _this.takeLatest(namespace, key, effect)
                    }()
                }
            }
        }
    }

    /**
     *为每个模块的reducer和effect添加前缀
     生成reucers
     * @param {*} model 模块
     * @returns
     * @memberof createSaga
     */
    createReducers() {
        for (const model of this.models) {
            this.moudlePrefix(model, 'reducers')
            this.reducers[model.namespace] = (state = model.state, action = {}) => (
                model.reducers[action.type] ? model.reducers[action.type](state, action) : state
            )
        }
        return this.reducers
    }

}

export default function (models) {
    const instance = new createSaga(models)
    instance.checkModels()
    return instance
}