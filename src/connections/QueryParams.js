import Assertions from "../utils/Assertions";

/**
 * A singleton class which helps generating API query parameters supported by Robe.
 */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["__integerValidation","__stringValidation","__stringArrayValidation","__getQParamPrefix","__opValidation"] }] */

class QueryParams {

    stringify(params: Object, url: String): string {
        // TODO: Additional validations will be added later.
        Assertions.isNotUndefined(params, true);
        if (!url) {
            url = "";
        }

        let paramArr = [];
        let isFirstParam = url.indexOf("?") === -1;
        this.__integerValidation(params.offset, 0, () => {
            paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_offset=${params.offset}`);
            isFirstParam = false;
        });
        this.__integerValidation(params.limit, 1, () => {
            paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_limit=${params.limit}`);
            isFirstParam = false;
        });
        this.__stringValidation(params.q, () => {
            paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_q=${params.q}`);
            isFirstParam = false;
        });
        if (Assertions.isNotUndefinedAndNull(params.fields)) {
            this.__stringArrayValidation(params.fields, "fields", () => {
                paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_fields=${params.fields.join()}`);
                isFirstParam = false;
            });
        }

        if (Assertions.isNotUndefinedAndNull(params.sort)) {
            if (!Assertions.isArray(params.sort)) {
                throw new Error(`Given sort value (${params.sort}) must a valid array.`);
            }
            paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_sort=`);
            isFirstParam = false;
            let sorts = [];
            for (let i = 0; i < params.sort.length; i += 1) {
                let item = params.sort[i];
                this.__stringArrayValidation(item, `sort[${i}]`);
                switch (item[1]) {
                    case "ASC":
                        sorts.push(`+${item[0]}`);
                        break;
                    case "DESC":
                        sorts.push(`-${item[0]}`);
                        break;
                    default:
                        throw new Error(`Given sort item (${item}) must a ASC or DESC.`);
                }
            }
            paramArr.push(sorts.join());
        }

        if (Assertions.isNotUndefinedAndNull(params.filters)) {
            if (!Assertions.isArray(params.filters)) {
                throw new Error(`Given filters value (${params.filters}) must a valid array.`);
            }
            paramArr.push(`${this.__getQParamPrefix(isFirstParam)}_filter=`);
            isFirstParam = false;
            let filters = [];
            for (let i = 0; i < params.filters.length; i += 1) {
                let item = params.filters[i];
                this.__opValidation(item, `filters[${i}]`);
                if (item[1] === "|=") {
                    let item2Joined = item[2].join("|");
                    filters.push(item[0] + item[1] + item2Joined);
                } else {
                    filters.push(item.join(""));
                }
            }
            paramArr.push(filters.join());
        }
        return url + paramArr.join("");
    }


    __integerValidation(value: number, min: number, cb: Function) {
        if (Assertions.isNotUndefinedAndNull(value)) {
            if (!Assertions.isInteger(value)) {
                throw new Error(`Given offset value (${value}) is not a number !`);
            }
            if (value < min) {
                throw new Error(`Given offset value (${value}) must be > ${min}.`);
            }
            cb();
        }
    }
    __stringValidation(value: string, cb: Function) {
        if (Assertions.isNotUndefinedAndNull(value)) {
            if (!Assertions.isString(value)) {
                throw new Error(`Given offset value (${value}) is not a string !`);
            }
            cb();
        }
    }

    __stringArrayValidation(value: Array, tag: string, cb: Function) {
        if (Assertions.isNotUndefinedAndNull(value)) {
            if (!Assertions.isArray(value)) {
                throw new Error(`Given ${tag} value (${value}) must a valid array.`);
            }
            for (let i = 0; i < value.length; i += 1) {
                if (!Assertions.isString(value[i])) {
                    throw new Error(`Given ${tag} value at ${i} (${value[i]}) must a valid string.`);
                }
            }
            if (cb !== undefined) {
                cb();
            }
        } else {
            throw new Error(`Given ${tag} item (${value}) must an array`);
        }
    }
    __opValidation(value: Array, tag: string) {
        if (!Assertions.isArray(value)) {
            throw new Error(`Given ${tag} value (${value}) must a valid array.`);
        }
        for (let i = 0; i < value.length; i += 1) {
            // if (!Assertions.isString(value[i])) {
            //     throw new Error(`Given ${tag} value at ${i} (${value[i]}) must a valid string.`);
            // }
        }
    }
    __getQParamPrefix(isFirstParam: boolean): string {
        return isFirstParam ? "?" : "&";
    }

}

export default new QueryParams();
