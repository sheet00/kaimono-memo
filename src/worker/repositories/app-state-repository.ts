import type {
  AppStateListRow,
  AppStateShoppingItemRow,
} from '../types/app-state'

export async function fetchAppStateRows(db: D1Database) {
  const [listsResult, shoppingItemsResult] = await Promise.all([
    db
      .prepare(
        `
          SELECT
            lists.id,
            lists.name,
            lists.sort_order,
            list_items.id AS item_id,
            list_items.name AS item_name,
            list_items.sort_order AS item_sort_order
          FROM lists
          LEFT JOIN list_items ON list_items.list_id = lists.id
          ORDER BY lists.sort_order, lists.created_at, list_items.sort_order, list_items.created_at
        `,
      )
      .all<AppStateListRow>(),
    db
      .prepare(
        `
          SELECT
            id,
            source_list_id,
            source_item_id,
            name,
            status,
            sort_order
          FROM shopping_items
          ORDER BY status, sort_order, created_at
        `,
      )
      .all<AppStateShoppingItemRow>(),
  ])

  return {
    listRows: listsResult.results ?? [],
    shoppingRows: shoppingItemsResult.results ?? [],
  }
}
