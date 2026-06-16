import type {
  AppStateList,
  AppStateListRow,
  AppStateResponse,
  AppStateShoppingItemRow,
} from '../types/app-state'

export function buildAppState(
  listRows: AppStateListRow[],
  shoppingRows: AppStateShoppingItemRow[],
): AppStateResponse {
  return {
    lists: buildLists(listRows),
    shoppingItems: shoppingRows.filter((item) => item.status === 'shopping'),
    basketItems: shoppingRows.filter((item) => item.status === 'basket'),
  }
}

function buildLists(rows: AppStateListRow[]): AppStateList[] {
  const lists = new Map<string, AppStateList>()

  rows.forEach((row) => {
    const currentList = lists.get(row.id) ?? {
      id: row.id,
      name: row.name,
      sortOrder: row.sort_order,
      items: [],
    }

    if (row.item_id && row.item_name) {
      currentList.items.push({
        id: row.item_id,
        name: row.item_name,
        sortOrder: row.item_sort_order ?? 0,
      })
    }

    lists.set(row.id, currentList)
  })

  return Array.from(lists.values())
}
