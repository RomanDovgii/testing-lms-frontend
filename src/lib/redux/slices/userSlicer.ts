import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type User = {
  id: number
  name: string
  surname: string
  github: string
  group: string
  role: string
} | null;

type UserState = {
  user: User | null
} 

const initialState: UserState = {
  user: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    logout: () => initialState,
  },
})

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer