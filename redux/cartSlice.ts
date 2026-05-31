import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface CartItem {
  _id: string
  name: string
  category: string
  price: number
  image: string
  unit: number
  quantity: number
}

interface CartState {
  cartData: CartItem[]
}

const initialState: CartState = {
  cartData: [],
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cartData.find(
        item => item._id === action.payload._id
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cartData.push({ ...action.payload, quantity: 1 })
      }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartData.find(i => i._id === action.payload)
      if (!item) return

      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        state.cartData = state.cartData.filter(i => i._id !== action.payload)
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter(
        item => item._id !== action.payload
      )
    },

    clearCart: (state) => {
      state.cartData = []
    }
  },
})

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
