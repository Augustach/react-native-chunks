const GlobalErrorUtils = (global as any).ErrorUtils

export function applyStackParser(ErrorUtils = GlobalErrorUtils) {
  const prevGlobalHandler = ErrorUtils.getGlobalHandler()

  function parseExtendedStackTrace(stack: string = '') {
    const lines = stack.split('\n')
    const result = []
    const regex = /(.+?) \(address at ([^:]+):(\d+):(\d+)\)/

    for (const line of lines) {
      const match = line.match(regex)
      if (match) {
        const [_, place, file, lineNum, columnNum] = match
        result.push([place, file, lineNum, columnNum])
      }
    }

    return result
  }

  function extractSourcemapOrder(input?: string) {
    if (!input) {
      return null
    }
    const regex = /sm-(\d+)/
    const match = input.match(regex)
    const sourcemapOrder = match?.[1]
    return sourcemapOrder ? String(parseInt(sourcemapOrder, 10) + 2) : null
  }

  const globalHandler = (error: Error, isFatal: boolean) => {
    const stacks = parseExtendedStackTrace(error.stack)
    const newStack = stacks
      .map(([place, file, line, column]) => {
        const parsedLine = extractSourcemapOrder(file) ?? line ?? '1'
        return `${place} (address at ${file}:${+parsedLine}:${column})`
      })
      .join('\n')

    error.stack = newStack
    prevGlobalHandler(error, isFatal)
  }

  GlobalErrorUtils.setGlobalHandler(globalHandler)
}
