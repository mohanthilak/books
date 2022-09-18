import {locationInterface} from "./index";


export interface AddBooksAPIInterface {
    name: string,
    location: locationInterface,
    author: string,
    mrp: number,
    priceOfBorrowing: number,
    library: string,
    owner: string
}