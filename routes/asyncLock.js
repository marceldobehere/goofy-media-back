const logLock = false;

export default class AsyncLock {
    constructor() {
        this.promiseArr = [];
        this.resolveArr = [];
    }

    disable() {
        if (this.resolveArr.length > 0) {
            if (logLock)
                console.log("Disabling lock");

            this.promiseArr.shift();
            this.resolveArr.shift()();
        } else
            alert("Invalid lock disable")
    }

    async enable() {
        if (logLock)
            console.log("Enabling lock");

        let tempPromises = [];
        for (let prom of this.promiseArr)
            tempPromises.push(prom);
        let bigPromise = Promise.all(tempPromises);

        let resolve;
        let promise = new Promise(r => resolve = r);
        this.promiseArr.push(promise);
        this.resolveArr.push(resolve);

        await bigPromise;
    }

    isLocked() {
        return this.resolveArr.length > 0;
    }

    reset() {
        this.promiseArr = [];
        this.resolveArr = [];
    }

    async tryEnable() {
        if (logLock)
            console.log("Trying to enable lock");

        if (this.resolveArr.length > 0)
            return false;

        await this.enable();
        return true;
    }

    async do(func) {
        await this.enable();
        try {
            let res = await func();
            this.disable();
            return res;
        } catch (e) {
            this.disable();
            console.error("Error: ", e);
        }
    }
};

// module.exports = AsyncLock;