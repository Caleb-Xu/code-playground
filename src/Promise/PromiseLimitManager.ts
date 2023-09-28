import makeLimitFn from './makeLimitFn'

export default class PromiseLimitManager<T extends unknown[], U> {

    private fn: (...val: T) => U | Promise<U>
    private limit: number

    private isRunning = false
    private promiseTaskQueue: (() => Promise<void>)[] = []
    private promisePool = new Set<Promise<void>>()

    constructor(fn: (...val: T) => U | Promise<U>, limit: number, start?: boolean) {
        this.fn = fn
        this.limit = limit

        if (start) this.start()
    }

    private run() {
        if (!this.isRunning) return
        while (this.promisePool.size < this.limit) {
            const task = this.promiseTaskQueue.shift()
            if (task) {
                const promise = task()
                    .finally(() => {
                        if (this.promisePool.has(promise)) {
                            this.promisePool.delete(promise)
                            this.run()
                        }
                    })
                this.promisePool.add(promise)
            } else {
                break
            }
        }
        return Promise.all(Array.from(this.promisePool))
    }

    append(...args: T) {
        return new Promise<U>((resolve, reject) => {
            const task = () => Promise.resolve(this.fn(...args)).then(resolve).catch(reject)
            this.promiseTaskQueue.push(task)
    
            if (this.isRunning) {
                this.run()
            }
        })
    }

    start () {
        this.isRunning = true
        this.run()
    }

    stop () {
        this.isRunning = false
    }

    static readonly makeLimitFn = makeLimitFn
}
