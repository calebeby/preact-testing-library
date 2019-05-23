import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
  configure as configureDTL,
} from 'dom-testing-library'

const mountedContainers = new Set()

function render(ui) {
  container = document.body.appendChild(document.createElement('div'))

  mountedContainers.add(container)

  return {
    container,
    baseElement,
    debug: (el = baseElement) => console.log(prettyDOM(el)),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => {
      render(rerenderUi, {container, baseElement})
    },
    ...getQueriesForElement(baseElement),
  }
}

function cleanup() {
  mountedContainers.forEach(cleanupAtContainer)
}

export * from 'dom-testing-library'
export {render, cleanup, fireEvent}
