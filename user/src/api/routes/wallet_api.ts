import { Application, Request, Response } from "express";
import { auth } from "../middlewares";
import { ServiceDependency } from "../../dependencyClass";

export const WalletAPI = (app: Application, services: ServiceDependency)=>{
    
    
    app.get("/wallet/:uid", auth, async (req, res)=>{
        try {
            if(req.user){
                const userWalletData = await services.WalletService.GetUserWallet({owner: req.user?._id})
                return res.status(userWalletData.success? 200 : 500).json(userWalletData)
            }
            if(!req.user) return res.status(401).json({success: false, data: null, error:"UnAuthorized"})
        } catch (error) {
            console.log("error while handling get user wallet by uid:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
    
    // internal
    app.get("/wallet/internal/:uid", async (req, res)=>{
        try {
            const userWalletData = await services.WalletService.GetUserWallet({owner: req.params.uid})
            return res.status(userWalletData.success? 200 : 500).json(userWalletData)
        } catch (error) {
            console.log("error while handling get user wallet by uid:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
    
    
    app.post("/wallet/add-money", auth, async(req:Request, res:Response)=>{
        try {
            if(!req.user) return res.status(401).json({success: false, data: null, error:"UnAuthorized"})
            // initiator, recipient, amount
            const {amount} = req.body;
            const data = await services.TransactionService.CreateTransaction({initiator: req.user?._id as string, recipient: req.user?._id as string, amount, operation: "deposit"})
            console.log({data})
            return res.status(200).json(data);
        } catch (error) {
            console.log("error while handling add money to wallet route:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
    
    app.post("/wallet/deposit-success", auth, async(req:Request, res:Response)=>{
        try {
            if(!req.user) return res.status(401).json({success: false, data: null, error:"UnAuthorized"})
            
            const {transactionID} = req.body;
            console.log(req.body)
            
            // update transactionDB
            const transactionData = await services.TransactionService.UpdateTransactionStatus({transactionID: transactionID, status:"completed"});
            // services.WalletService 
            if(transactionData.success && transactionData.data){
                // services.WalletService 
                const walletData = await services.WalletService.AddMoneyToUserWallet({owner: req.user._id, transactionID: transactionData.data?._id as unknown as string, amount: transactionData?.data?.amount as number});
                return res.status(200).json(walletData);
            }else{
                return res.status(500).json(transactionData)
            }
            
        } catch (error) {
            console.log("error while handling add money to wallet route:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
}
