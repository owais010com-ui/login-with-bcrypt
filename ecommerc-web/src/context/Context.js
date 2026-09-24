import React, { createContext, useReducer } from 'react'
import { reducer } from './Reducer';

export const GlobalContext = createContext("Initial Value");

let userData = {
    user: {},
    isLogin: null,
    baseUrl: ''

}

export default function ContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, userData);
    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    )
}