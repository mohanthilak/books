import { WalletRepository } from "../database/Repositories/Wallet_Repository";

class WalletService {
    
    private walletRepo;

    constructor(walletRepo: WalletRepository){
        this.walletRepo = walletRepo;
    }

    async AddMoneyToUserWallet({owner, transactionID, amount}:{owner: string, transactionID: string, amount: number}){
        return this.walletRepo.AddMoneyToUserWallet({owner, transactionID, amount});
    }

    async GetUserWallet({owner}:{owner: string}){
        return this.walletRepo.GetUserWallet({owner});
    }
}

export {WalletService}