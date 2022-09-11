import { AnyAction } from "redux"
import { Order } from "../../types/Order"

interface OrdersState {
    orders: Order[]
}

export const InitailOrdersState: OrdersState = {
    orders: [],
}

const ordersReducer = (state = InitailOrdersState, { type, payload }: AnyAction) => {
    switch (type) {
        case "ADD_ORDER":
            return {
                ...state,
                orders: [...state.orders, payload.order],
            }
        case "REMOVE_ORDER":
            return {
                ...state,
                orders: state.orders.splice(
                    state.orders.findIndex((order) => order.id === payload.id),
                    1
                ),
            }
        case "UPDATE_ORDER":
            let updatedData = payload.data
            state.orders.forEach((order) => {
                if (order.id === updatedData.id) {
                    order.received = updatedData.received
                }
            })
            console.log("Update state in orderReducer", state.orders)
            return state
        case "FINALIZE_ORDER":
            let finalizedData = payload.data
            state.orders.forEach((order) => {
                if (order.id === finalizedData.id) {
                    order.received = finalizedData.received
                    order.status = finalizedData.status
                }
            })
            console.log("Update state in orderReducer", state.orders)
            return state
        default:
            return state
    }
}

export default ordersReducer
