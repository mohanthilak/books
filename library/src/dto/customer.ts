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
