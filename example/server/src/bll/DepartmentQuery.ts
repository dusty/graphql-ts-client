import 'reflect-metadata';
import { Arg, Query } from 'type-graphql';
import { departmentTable, TDepartment } from '../dal/DepartmentRepostiory';
import { Department } from '../model/Department';

export class DepartmentQuery {

    @Query(() => [Department])
    findDepartmentsLikeName(
        @Arg("name", () => String, {nullable: true}) name?: string
    ): Department[] {
        const lowercaseName = name?.toLocaleLowerCase();
        const predicate: ((row: TDepartment) => boolean) | undefined = 
            lowercaseName !== undefined && lowercaseName !== "" ?
            d => d.name.toLowerCase().indexOf(lowercaseName) !== -1 :
            undefined
        return departmentTable
            .scan(predicate)
            .map(row => new Department(row));
    }
}