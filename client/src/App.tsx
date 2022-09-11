import { useEffect } from "react"
import Orders from "./components/Orders"
import Items from "./components/Items"
import store from "./redux/store"
import { updateItem } from "./redux/action/itemsAction"
import { useAppDispatch, useAppSelector } from "./redux/hook"
import { finalizeOrder, updateOrder } from "./redux/action/ordersAction"
import io from "socket.io-client"

const socket = io("http://localhost:8000")

function App() {
    document.title = "Hashpays MVP"

    const { orders } = useAppSelector((state) => state.orders)
    const { items } = useAppSelector((state) => state.items)
    const dispatch = useAppDispatch()

    useEffect(() => {
        // Event for testing receive message from server
        socket.on("receive_message", (data) => {
            console.log(data.message)
        })

        // Listen to `update_payment` event that get the updating result of specific payment (order) : new received as number
        socket.on("update_payment", (data) => {
            console.log("Update payment from Server :", data)
            dispatch(updateOrder(data))
        })

        // Listen to `finalize_payment` event that get the end result of specific payment (order) : status `success` or `fail`
        socket.on("finalize_payment", (data) => {
            console.log("The final result for the payment from Server :", data)
            dispatch(finalizeOrder(data))
            if (data.status === "success") {
                dispatch(updateItem({ orderId: data.id }))
            }
        })

        return () => {
            socket.off("receive_message")
            socket.off("update_payment")
            socket.off("finalize_payment")
        }
    }, [])

    // Subscribe global state of redux state includes orders,items
    store.subscribe(() => {
        console.log("Global state change")
        console.log("Orders :", orders)
        console.log("Items :", items)
    })

    return (
        <div className="flex flex-col justify-center items-center w-full gap-4 p-10">
            <h1 className="font-bold text-extra text-xl">
                <span className="text-[#00c5c5] font-bold"> Hashpays</span> MVP by Khemmapich
            </h1>

            <Items />

            <Orders />
        </div>
    )
}

export default App
