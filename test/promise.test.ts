import { should } from 'chai'
import makeLimitFn from '../src/Promise/limit/makeLimitFn'

should()

describe('promise limit test', () => {
    it('valueType', () => {
        makeLimitFn(() => {}, 2).should.be.a('function')
    })

    const testFn = async ({ itemList, result }: { itemList: number[], result: number[] }) => {
        const taskList: number[] = []
        const testCb = (item: number) => {
            taskList.push(item)
            return new Promise<number>(resolve => {
                setTimeout(() => {
                    taskList.push(item)
                    resolve(item);
                }, item)
            });
        }
        const fn = makeLimitFn(async (item: number) => {
            await testCb(item)
        }, 2)
        const promises = itemList.map(fn)
        await Promise.all(promises)
        taskList.should.be.deep.equal(result)
    }

    it('testFn', async () => {
        const testTasks = [
            testFn({
                itemList: [1000, 2000, 5000, 2000, 3000],
                result: [1000, 2000, 1000, 5000, 2000, 2000, 2000, 3000, 5000, 3000]
            })
        ]
        await Promise.allSettled(testTasks)
    })
})
