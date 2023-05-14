export interface locationInterface{
    location:{
        type: string,
        coordinates: [number, number]
    }
}

export interface userAuthDataInterface{
    username: string,
    _id: string
}

export interface signUpInterface{
    username: string,
    password: string,
}


export interface userType{
    username: string,
    password: string,
    _id: string,
}

export interface updateLocationInterface{
    user: userAuthDataInterface,
    latitude: string,
    longitude: string
}

export interface bookBasicInterface{
    name: string,
    author:string,
    mrp:number,
    priceOfBorrowing: number
}

export interface UserDetailsWithoutPassword {
    username: string,
    _id: string,
    roles: string[],
    libraries: string[]
}

// ------------------------------------------------------------------------------------------------- //
// User-Repository Return Types


export interface signUpInterfaceReturn {
    created: boolean,
    data: userAuthDataInterface|null,
    message: string
}

export interface GetPasswordReturn {
    err: boolean,
    data: {
        password: string,
        _id: string
    }|null,
    message:string
}

export interface DeleteRefreshTokenReturn {
    error: any
}

export interface GetUserWithUsernameReturn {
    err: boolean,
    userExists: boolean,
    data: UserDetailsWithoutPassword | null,
    message: string
}

export interface AddRefreshTokenReturn {
    error: boolean
}

export interface FindRefreshTokenReturn {
    err: null|boolean,
    data: null,
    message: string
}

export interface AddlibraryReturn {
    err: boolean,
    message: string
}

//-----------------------------------------------------------------------------------------------------------
export interface AuthTokens {
    AccessToken: string,
    RefreshToken: string,
}