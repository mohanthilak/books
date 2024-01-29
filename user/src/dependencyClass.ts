import { UserRepository } from "./database";
import { UserService } from "./services";
import {TransactionService} from "./services/Transaction_Service"
import { WalletService } from "./services/Wallet_Service";

class ServiceDependency {
    userService;
    TransactionService;
    WalletService;
    constructor(US: UserService, TS: TransactionService, WS:WalletService){
        this.userService = US;
        this.TransactionService = TS;
        this.WalletService = WS;
    }
}

class RepositoryDependency {
    readonly userRepo;
    constructor(UR: UserRepository){
        this.userRepo = UR;
    }
}

export {ServiceDependency, RepositoryDependency};