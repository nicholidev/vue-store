import { isServer } from '@vue-storefront/core/helpers'
import { Logger } from '@vue-storefront/core/lib/logger'

const DEFAULT_ACTION_CATEGORY = 'asyncData'
// Data loader queues all the data fetching operations and runs them at once - to be usedf for example in the `asyncData()` functions
interface AsyncDataLoaderActionContext {
  category?: string,
  route: any,
  store: any,
  context: any
}

// Data loader queues all the data fetching operations and runs them at once - to be usedf for example in the `asyncData()` functions
interface AsyncDataLoaderAction {
  execute: any, // this function must return a Promise
  category?: string,
  name?: string,
  executedAt?: Date,
  scheduledAt?: Date
}

/** AsyncDataLoader helper for queueing the data fetching operations. The main purpose is to decentralize the `asyncData()` SSR method */
const AsyncDataLoader = {

  queue : new Array<AsyncDataLoaderAction>(),

  push : function (action: AsyncDataLoaderAction) {
    if (!action.category) action.category = DEFAULT_ACTION_CATEGORY
    action.scheduledAt = new Date()
    this.queue.push(action)
  },
  flush : function (actionContext: AsyncDataLoaderActionContext) {
    if (!actionContext.category) actionContext.category = DEFAULT_ACTION_CATEGORY
    const actionsToExecute = this.queue.filter(ac => (!ac.category || !actionContext.category) || ac.category === actionContext.category && (!ac.executedAt)).map(ac => {
      return ac.execute(actionContext) // function must return Promise
    })
    if (actionsToExecute.length > 0) {
      Logger.info('Executing data loader actions(' + actionsToExecute.length + ')', 'dataloader')()
    }
    return Promise.all(actionsToExecute).then(results => {
      actionsToExecute.map(ac => ac.executedAt = new Date())
      return results
    })
  }
}

export { AsyncDataLoader, AsyncDataLoaderActionContext, AsyncDataLoaderAction } 
