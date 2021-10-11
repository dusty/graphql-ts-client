"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphStateGenerator = void 0;
const graphql_1 = require("graphql");
const path_1 = require("path");
const Generator_1 = require("../Generator");
const TriggerEventWriter_1 = require("./TriggerEventWriter");
const TypedConfigurationWriter_1 = require("./TypedConfigurationWriter");
class GraphStateGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(ctx, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateTypedConfiguration(ctx));
            promises.push(this.generateTriggerEvents(ctx));
        });
    }
    generateTypedConfiguration(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "TypedConfiguration.ts"));
            new TypedConfigurationWriter_1.TypedConfigurationWriter(ctx, stream, this.config).write();
            yield Generator_1.closeStream(stream);
        });
    }
    generateTriggerEvents(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mkdirIfNecessary("triggers");
            for (const fetcherType of ctx.fetcherTypes) {
                if (fetcherType.name === "Mutation") {
                    continue;
                }
                if (fetcherType instanceof graphql_1.GraphQLObjectType) {
                    if (ctx.connectionTypes.has(fetcherType) || ctx.edgeTypes.has(fetcherType)) {
                        continue;
                    }
                }
                if (fetcherType instanceof graphql_1.GraphQLObjectType || fetcherType instanceof graphql_1.GraphQLInterfaceType) {
                    const stream = Generator_1.createStreamAndLog(`triggers/${fetcherType.name}Event.ts`);
                    new TriggerEventWriter_1.TriggerEventWiter(fetcherType, fetcherType.name === "Query" ? undefined : "id", stream, this.config).write();
                    yield Generator_1.closeStream(stream);
                }
            }
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        return __awaiter(this, void 0, void 0, function* () {
            stream.write(`export type { newTypedConfiguration } from "./TypedConfiguration";\n`);
            yield _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.GraphStateGenerator = GraphStateGenerator;