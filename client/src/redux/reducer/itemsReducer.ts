import { AnyAction } from "redux"
import { ItemInterface } from "../../types/Item"
import itemsFromDB from "../../clientDatabase/items"

interface ItemState {
    items: ItemInterface[]
}

export const InitialItemState: ItemState = {
    items: itemsFromDB,
}

const itemsReducer = (state = InitialItemState, { type, payload }: AnyAction) => {
    switch (type) {
        case "UPDATE_ITEM":
            state.items.forEach((item) => {
                if (item.name === payload.itemName) {
                    item.owned = item.owned + payload.addOwned
                }
            })
            console.log("Update state in itemsReducer", state.items)
            return state
        default:
            return state
    }
}

export default itemsReducer
