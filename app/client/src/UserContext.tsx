import { ReactNode, createContext, useState} from "react";

type Props = {
    children?: ReactNode
}

type IAuthContext = {
    authenticated: boolean;
    setAuthenticated: (newState: boolean) => void
}

const initVal = {
    authenticated : false,
    setAuthenticated: () => {}
}

const UserContext = createContext<IAuthContext>(initVal);

const AuthProvider = ({children} : Props) => {

    const [ authenticated, setAuthenticated] = useState(initVal.authenticated);

    return (
        <UserContext.Provider value={{authenticated, setAuthenticated}}>
            {children}
        </UserContext.Provider>
    )
}

export { UserContext, AuthProvider}