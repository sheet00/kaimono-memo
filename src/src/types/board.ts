export type BoardItem = {
  id: string
  name: string
}

export type BoardColumn = {
  id: string
  title: string
  items: BoardItem[]
}

export type PageMode = 'lists' | 'shopping'
export type CheckedItems = Record<string, true>
export type BasketItems = Record<string, true>

export type ShoppingEntry = {
  key: string
  id: string
  item: string
  sourceTitle: string
  columnId: string
}

