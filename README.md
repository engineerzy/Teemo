## 项目描述

基于redux-saga的react数据处理方法，模仿dva，
传入模块文件，启动项目

### 模块文件结构如下

```javascript
import { delay } from "redux-saga/effects"
import * as types from "types" // action类型文件，根据文件大小决定是否单独新开一个文件
export default {
    namespace: 'nav',
    state: {
        age: 18,
        name: '张三'
    },
    effect: {
        *add_age_async({ num },{put,call,select}) {
            yield delay(1000)
            yield put({type: types.ADD_AGE_SYNC,num: num})
        }
    },
    reducers: {
        [types.ADD_AGE_SYNC](state, action) {
            return {
                ...state,
                age: action.num + state.age
            }
        },
        add_age_async(state,action) {
            return {
                ...state,
                age: 2 + state.age
            }
        }
    }
}
```

### 启动

```javascript
import createTeemo from "Teemo"
import home from "home" // 模块文件
import nav from "nav" // 模块文件

const store = createTeemo({
    models: [home,nav]
})
export default store

```
