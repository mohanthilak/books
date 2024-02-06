
import {TransactionRepo} from "../database"
import axios from "axios";
import {NOTIFICATION_SERVICE_URL} from "../config"
class TransactionService{
    private readonly TransactionRepository;
    constructor(TransactionRepository: TransactionRepo){
        this.TransactionRepository = TransactionRepository;
    }

    async CreateTransaction({initiator, recipient, amount, operation}: {initiator:string, recipient:string, amount:number, operation:string}){
        try {
            const repoData = await this.TransactionRepository.CreateTransaction({initiator, recipient, amount});
            // If repo was able to create a transaction in the DB, contact Notification service to make the transactions using Razorpay
            let paymentsData = null;

            if(repoData.success){
                paymentsData = await axios.post(`${NOTIFICATION_SERVICE_URL}/razorpay/initiate-transaction`, {
                    amount: 5000,
                    receipt: repoData.data?._id,
                    operation,
                })
            }
            return {success: true, data:  {repoData: repoData.data , paymentsData:paymentsData?.data.data}, error: null};
        } catch (error) {
            console.log('error while handling createtransaction in service layer:',error);
            return {success: false, data: null, error}
        } 
    }

    async UpdateTransactionStatus({transactionID, status}:{transactionID:string, status:string}){
        return this.TransactionRepository.UpdateTransactionStatus({transactionID, status});
    }
}

export {TransactionService};