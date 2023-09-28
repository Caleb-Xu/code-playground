export default function makeLimitFn<T extends unknown[], U> (fn: (...val: T) => U | Promise<U>, limit: number) {
    const promiseTaskQueue: (() => Promise<void>)[] = []
    const promisePool = new Set<Promise<void>>()

    function run () {
        while (promisePool.size < limit) {
            const task = promiseTaskQueue.shift()
            if (task) {
                const resultPromise = task()
                const promise = resultPromise
                    .finally(() => {
                        if (promisePool.has(promise)) {
                            promisePool.delete(promise)
                        }
                        run()
                    })
                promisePool.add(promise)
            } else {
                break
            }
        }
        Promise.all(Array.from(promisePool))
    }

    return (...args: T) => {
        return new Promise<U>((resolve, reject) => {
            const task = () => Promise.resolve(fn(...args)).then(resolve).catch(reject)
            promiseTaskQueue.push(task)
            run()
        })
    }
}