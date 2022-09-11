import { Dispatch } from "redux"
import { Order } from "../../types/Order"

interface UpdateData {
    received: string
    payment_amount: number
    userAddress: string
    merchantAddress: string
    id: string
    status: string
}

// ADD_ORDER: Add order to orders state
export const addOrder = (order: Order) => async (dispatch: Dispatch) => {
    try {
        dispatch({
            type: "ADD_ORDER",
            payload: {
                order: order,
            },
        })
    } catch (error) {
        console.log(error)
    }
}

// REMOVE_ORDER: Add order to orders state
export const removeOrder = (id: string) => async (dispatch: Dispatch) => {
    try {
        dispatch({
            type: "REMOVE_ORDER",
            payload: {
                id,
            },
        })
    } catch (error) {
        console.log(error)
    }
}

// UPDATE_ORDER: Update order of specific order in orders state
export const updateOrder = (data: UpdateData) => (dispatch: Dispatch) => {
    try {
        dispatch({
            type: "UPDATE_ORDER",
            payload: {
                data,
            },
        })
    } catch (error) {
        console.log(error)
    }
}

// FINALIZE_ORDER: Finalize order result : success or fail
export const finalizeOrder = (data: UpdateData) => (dispatch: Dispatch) => {
    try {
        dispatch({
            type: "FINALIZE_ORDER",
            payload: {
                data,
            },
        })
    } catch (error) {
        console.log(error)
    }
}
