import { WalletModel } from "../Models/Wallet";

class WalletRepository {
    async AddMoneyToUserWallet({owner, transactionID, amount}:{owner:string, transactionID:string, amount:number}){
        try {
            let wallet = await WalletModel.findOne({owner});
            if(wallet){
                wallet.transactions = [...wallet.transactions, transactionID];
                wallet.amount += amount;
            }else{
                wallet = new WalletModel({owner, amount});
                wallet.transactions = [transactionID];
            }
            await wallet.save();
            return {success: true, data: wallet, error: null};
        } catch (error) {
            console.log("error while adding amount to the wallet:", error);
            return {success: false, data:null, error}
        }
    }

    async GetUserWallet({owner}:{owner:string}){
        try {
            const wallet = await WalletModel.findOne({owner});
            return {success: wallet?true:false, data: wallet, error: wallet?null:"user has no wallet"}
        } catch (error) {
            console.log("error while getting user wallet from DB:", error);
            return {success: false, data:null, error}
        }
    }
}

export {WalletRepository}