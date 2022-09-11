import { Dispatch } from "redux"
import store from "../store"

interface UpdateData {
    orderId: string
}

export const updateItem = (data: UpdateData) => (dispatch: Dispatch) => {
    try {
        const orders = store.getState().orders.orders
        let order = orders.find((order) => order.id === data.orderId)
        console.log("Get into update Item", order)
        dispatch({
            type: "UPDATE_ITEM",
            payload: {
                itemName: order.item.name,
                addOwned: 1,
            },
        })
    } catch (error) {
        console.log(error)
    }
}
