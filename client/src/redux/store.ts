import { configureStore } from "@reduxjs/toolkit"
import itemsReducer from "./reducer/itemsReducer"
import ordersReducer from "./reducer/ordersReducer"

const store = configureStore({
    reducer: {
        orders: ordersReducer,
        items: itemsReducer,
    },
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {orders::OrderState,items:ItemState}
export type AppDispatch = typeof store.dispatch
