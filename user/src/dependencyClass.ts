import { UserRepository } from "./database";
import { UserService } from "./services";

class ServiceDependency {
    private readonly userService;
    constructor(US: UserService){
        this.userService = US;
    }
}

class RepositoryDependency {
    readonly userRepo;
    constructor(UR: UserRepository){
        this.userRepo = UR;
    }
}

export {ServiceDependency, RepositoryDependency};

// export const GetServicesObj = (us: UserService): ServiceDependency=>{
//     return new ServiceDependency(us);
// }