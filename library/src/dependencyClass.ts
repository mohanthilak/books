import { BooksRepository, LibraryRepository } from "./database";
import { BooksService, LibraryService } from "./services";

class ServiceDependency {
    booksService;
    libraryService;
    constructor(BS: BooksService, LS: LibraryService){
        this.booksService = BS;
        this.libraryService = LS;
    }
}

class RepositoryDependency {
    readonly booksRepo;
    readonly libraryRepo;
    constructor(BR: BooksRepository, LR: LibraryRepository){
        this.booksRepo = BR;
        this.libraryRepo = LR;
    }
}

export {ServiceDependency, RepositoryDependency};