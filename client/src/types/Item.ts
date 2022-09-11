interface ItemInterface {
    name: string
    price: number
    owned: number
}

interface ItemBoxInterface {
    name: string
    price: number
    owned: number
    buyAble: boolean
}

export type { ItemInterface, ItemBoxInterface }
