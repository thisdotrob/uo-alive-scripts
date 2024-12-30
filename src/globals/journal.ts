export default {
  clear: (): void => journal.clear,
  waitForTextAny: (text: string[], author?: string, timeout?: number): null | string => journal.waitForTextAny(text, author, timeout),
}
