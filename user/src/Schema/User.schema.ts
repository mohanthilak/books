import {object, string, TypeOf} from 'zod';

export const createUserSchema = object({
    body: object({
        username: string({
            required_error: "Username is required"
        }),
        password: string({
            required_error: "Password is required"
        }).min(6, "Password is too short - should be minimum 8 characters"),
    })
})

export const getUserDetailsSchema = object({
    body: object({})
});


export type CreateUserInput = TypeOf<typeof createUserSchema>['body']

export type GetUserDetailsInput = TypeOf<typeof getUserDetailsSchema>['body'];