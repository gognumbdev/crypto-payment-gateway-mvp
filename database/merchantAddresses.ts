interface MerchantAddress {
    name: string
    address: string
    status: "ready" | "pending"
}

let merchantAddresses: Array<MerchantAddress> = [
    { name: "merchant 1", address: "0x518707e145604eA17eA6fd319Fa65DCD2E96Eb34", status: "ready" },
    { name: "merchant 2", address: "0xC61D4ee4B910E52E04512bbf7CcEb0Ab48072227", status: "ready" },
    { name: "merchant 3", address: "0x834BeA852d66f2899363cbC113d09aB775CA760F", status: "ready" },
    { name: "merchant 4", address: "0x6DF3B03E6552101CaB3E4257DE92cCd182ffd6B1", status: "ready" },
    { name: "merchant 5", address: "0xAD446F07745798172482abea54fb57d95079D38A", status: "ready" },
]

export default merchantAddresses
export { MerchantAddress }
