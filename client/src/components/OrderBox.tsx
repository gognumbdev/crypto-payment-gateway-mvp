import { IOrderBox } from "../types/Order"

const OrderBox = ({ item, merchantAddress, received, status, id }: IOrderBox) => {
    return (
        <div
            className="flex flex-col gap-2 my-4 border-2 border-[#00c5c5] rounded px-6 py-4 min-w-[500px] w-8/12"
            id={id}
        >
            <p className="text-xl">
                Buying <span className="font-bold">{item?.name}</span>
            </p>
            <hr className="bg-[#00c5c5] w-full h-[2px]" />
            <p>
                Please transfer <span className="font-medium">{item.price} ETH </span>
                to <span className="font-medium">{merchantAddress}</span>
            </p>
            <div>
                {status === "pending" ? (
                    received > 0 && (
                        <p className="italic text-gray-500">
                            Received {received} ETH, {item.price - received} ETH remainnig...
                        </p>
                    )
                ) : status === "success" ? (
                    <p className="text-[#00c5c5]">
                        Successfully transfer {item.price} ETH to {merchantAddress}
                    </p>
                ) : (
                    <p className="text-red-500">
                        Fail to transfer {item.price} ETH to {merchantAddress}
                    </p>
                )}
            </div>
        </div>
    )
}

export default OrderBox
