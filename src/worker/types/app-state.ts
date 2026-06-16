export type AppStateListRow = {
  id: string
  name: string
  sort_order: number
  item_id: string | null
  item_name: string | null
  item_sort_order: number | null
}

export type AppStateShoppingItemRow = {
  id: string
  source_list_id: string
  source_item_id: string | null
  name: string
  status: 'shopping' | 'basket'
  sort_order: number
}

export type AppStateListItem = {
  id: string
  name: string
  sortOrder: number
}

export type AppStateList = {
  id: string
  name: string
  sortOrder: number
  items: AppStateListItem[]
}

export type AppStateShoppingItem = {
  id: string
  source_list_id: string
  source_item_id: string | null
  name: string
  status: 'shopping' | 'basket'
  sort_order: number
}

export type AppStateResponse = {
  lists: AppStateList[]
  shoppingItems: AppStateShoppingItem[]
  basketItems: AppStateShoppingItem[]
}
