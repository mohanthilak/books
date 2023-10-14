export interface locationInterface{
    location:{
        type: string,
        coordinates: [number, number]
    }
}

export interface userAuthDataInterface{
    email: string,
    _id: string
}

export interface signUpInterface{
    email: string,
    password: string,
}


export interface userType{
    email: string,
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
    email: string,
    _id: string,
    libraries: string[]
}

// ------------------------------------------------------------------------------------------------- //
// User-Repository Return Types


export interface signUpInterfaceReturn {
    success: boolean,
    data: userAuthDataInterface|null,
    error: any
}

export interface GetPasswordReturn {
    err: boolean,
    data: {
        password: string,
        _id: string
    },
    message:string
}

export interface DeleteRefreshTokenReturn {
    success: boolean,
    data: any,
    error: any
}

export interface GetUserWithEmailReturn {
    err: boolean,
    userExists: boolean,
    data: UserDetailsWithoutPassword | null,
    message: string
}

export interface AddRefreshTokenReturn {
    error: boolean
}

export interface FindRefreshTokenReturn {
    success: boolean
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
    accessToken: string,
    refreshToken: string,
}