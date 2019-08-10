import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
  FireFunction,
  FireObject,
  EventType,
} from '@testing-library/dom'
import {
  render as preactRender,
  ComponentChild,
  options as preactOptions,
} from 'preact'

const mountedContainers = new Set<HTMLElement>()

const render = (ui: ComponentChild) => {
  const baseElement = document.body
  const container = document.createElement('div')
  baseElement.append(container)

  preactRender(ui, container)

  mountedContainers.add(container)

  return {
    container,
    baseElement,
    debug: (el = baseElement) => console.log(prettyDOM(el)),
    ...getQueriesForElement(baseElement),
  }
}

const cleanupAtContainer = (container: HTMLElement) => {
  // Preact's way of "un-rendering"
  preactRender(null, container)
  container.remove()
  mountedContainers.delete(container)
}

const cleanup = () => {
  mountedContainers.forEach(cleanupAtContainer)
}

const preactQueue: (() => void)[] = []

const flushPreactQueue = () => {
  let cb
  while ((cb = preactQueue.shift())) {
    try {
      cb()
    } catch (error) {}
  }
}

export const setPreactOptions = (options = preactOptions) => {
  // we use our own queue here rather than cb => cb() to preserve the async
  // nature of preact in most cases, while giving us the ability to flush the
  // queue synchronously when firing events
  // @ts-ignore
  options.debounceRendering = (f: () => void) => {
    preactQueue.push(f)
    setTimeout(flushPreactQueue)
  }
}

setPreactOptions()

// Ensure that event callbacks are all called before continuing
// @ts-ignore
const fireEvent: FireFunction & FireObject = (...args) => dtlFireEvent(...args)

Object.entries(dtlFireEvent).forEach(
  // @ts-ignore
  ([key, value]: [EventType, FireObject[EventType]]) => {
    fireEvent[key] = (...args) => {
      const returnValue = value(...args)
      flushPreactQueue()
      return returnValue
    }
  },
)

export * from '@testing-library/dom'
export { render, cleanup, fireEvent }
