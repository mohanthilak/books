import {TransactionsModel} from "../Models/Transactions" 
class TransactionRepo {
    async CreateTransaction({initiator, recipient, amount}: {initiator:string, recipient:string, amount:number}){
        try {
            // const transaction = new TransactionsModel({initiator, recipient, amount});
            // await transaction.save();
            const transaction = await TransactionsModel.create({initiator, recipient, amount})
            return {success: true, data: transaction, error: null}
        } catch (error) {
            console.log("error while creating a transaction in the db:", error);
            return {success: true, data: null, error}
        }
    }


    async UpdateTransactionStatus({transactionID, status}:{transactionID:string, status:string}){
        try {
            const transaction = await TransactionsModel.findById(transactionID);
            if(transaction){
                transaction.status = status;
                await transaction.save();
                return {success: true, data: transaction, error: null};    
            }
            return {success: false, data: null, error: "invalid transactionID"}

        } catch (error) {
            console.log("error while updating the transaction status:", error);
            return {success: false, data: null, error}
        }
    }
}

export {TransactionRepo};