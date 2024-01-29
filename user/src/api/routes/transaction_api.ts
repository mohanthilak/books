import { Application } from "express";
import { auth } from "../middlewares";
import { ServiceDependency } from "../../dependencyClass";

export const TransactionsAPI = (app: Application, services: ServiceDependency) => {
    app.post("/transaction/create", async (req, res) => {
        try {
            const {initiator, recipient, amount} = req.body;
            const data = await services.TransactionService.CreateTransaction({initiator, recipient, amount, operation: ""});
            console.log(data)
            return res.status(data.success?200:500).json(data);
        } catch (error) {
            console.log("error while handling create transactions route:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
}


