export type BoardColumn = {
  id: string
  title: string
  items: string[]
}

export type PageMode = 'lists' | 'shopping'
export type CheckedItems = Record<string, true>
export type BasketItems = Record<string, true>

export type ShoppingEntry = {
  key: string
  item: string
  sourceTitle: string
  columnId: string
}
