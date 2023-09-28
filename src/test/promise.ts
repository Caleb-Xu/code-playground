import PromiseLimitManager from "../Promise/PromiseLimitManager";

const baseTime = +new Date()
const log = (...args: any[]) => console.log(+new Date() - baseTime, ': ', ...args)

const testCb = (item: number) => {
    return new Promise<number>((resolve) => {
        log('开始', item);
        setTimeout(() => {
            log('结束', item);
            resolve(item);
        }, item)
    });
}

const cb = PromiseLimitManager.makeLimitFn(testCb, 3)

cb(1000)
    .then(result => {
        log('结果是', result);
    })
cb(2000)
cb(5000)
cb(2000)
cb(3000)

// const manager = new PromiseLimitManager(testCb, 3, true)

// manager.append(1000)
// manager.append(2000)
// manager.stop()
// manager.append(5000)
// manager.append(2000)
// manager.append(3000)

// setTimeout(() => {
//     manager.start()
//     manager.append(2000)
// }, 3500)