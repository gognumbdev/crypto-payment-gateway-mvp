import axios from "axios"
import io from "socket.io-client"
import config from "../config"
import { ItemBoxInterface } from "../types/Item"
import { Order } from "../types/Order"
import { addOrder } from "../redux/action/ordersAction"
import { useAppDispatch } from "../redux/hook"

const socket = io("http://localhost:8000")

const ItemBox = ({ name, price, owned, buyAble }: ItemBoxInterface) => {
    const dispatch = useAppDispatch()

    const handleBuyItem = async () => {
        // Get user address on ethereum blockchian from user
        let userAddress = prompt(
            "Please enter your address on Ethereum blockchain to make transaction"
        )

        if (userAddress == null) throw "InputError : userAddress can't be null"

        // Request CreatePayment to Server (http://localhost:8000/)
        let paymentConfig = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }
        let paymentData = JSON.stringify({
            userAddress,
            network: "ETH",
            currency: "ETH",
            amount: price,
        })
        let paymentRes = await axios.post(
            `${config.endpoint}/api/crypto/payments/createPayment`,
            paymentData,
            paymentConfig
        )

        let payment = await paymentRes.data
        console.log("Created Payment", payment)
        // socket.emit("monitor_payment", payment)
        socket.emit("add_payment_to_monitor", payment)

        // Order need : merchantAddress and id
        let order: Order = {
            item: { name, price, owned },
            userAddress,
            received: 0.0,
            status: "pending",
            merchantAddress: payment.merchantAddress,
            id: payment.id,
        }

        console.log("Created Order", order)
        dispatch(addOrder(order))
    }

    return (
        <div className="flex flex-col gap-4 items-start shadow rounded border-[1px] px-6 py-4 min-w-[200px] border-gray-500">
            <p className="font-extrabold">{name}</p>
            <p>
                price: <span className="font-medium">{price}</span> ETH
            </p>
            <p>
                owned: <span className="font-medium">{owned}</span>
            </p>
            <button
                className={`border-[1px] border-gray-300 w-full rounded font-medium  bg-amber-400
                ${
                    buyAble
                        ? "cursor-pointer hover:scale-110 transition ease-in-out transform 300ms hover:border-gray-500 active:scale-90"
                        : "opacity-50"
                }`}
                onClick={handleBuyItem}
                disabled={!buyAble}
            >
                Buy
            </button>
        </div>
    )
}

export default ItemBox
