import {
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { initialBoardColumns } from '../data/initialBoardColumns'
import type {
  BasketItems,
  BoardColumn,
  CheckedItems,
  PageMode,
  ShoppingEntry,
} from '../types/board'
import { getItemKey } from '../utils/getItemKey'

export function useBoardPage() {
  const [columns, setColumns] = useState(initialBoardColumns)
  const [pageMode, setPageMode] = useState<PageMode>('lists')
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState('')
  const [addingCardColumnId, setAddingCardColumnId] = useState<string | null>(null)
  const [newCardValue, setNewCardValue] = useState('')
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})
  const [basketItems, setBasketItems] = useState<BasketItems>({})
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null)
  const [editingCardValue, setEditingCardValue] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  const findColumnByItemId = (itemId: string) =>
    columns.find((column) => column.items.includes(itemId))

  const findColumnByTargetId = (targetId: string | null) => {
    if (!targetId) {
      return null
    }

    const matchedColumn = columns.find((column) => column.id === targetId)
    if (matchedColumn) {
      return matchedColumn
    }

    return findColumnByItemId(targetId)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItemId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null

    const activeColumn = findColumnByItemId(activeId)
    const overColumn = findColumnByTargetId(overId)

    if (!activeColumn || !overColumn) {
      setOverColumnId(null)
      return
    }

    setOverColumnId(overColumn.id)

    if (activeColumn.id === overColumn.id) {
      return
    }

    setColumns((currentColumns) => {
      const sourceColumn = currentColumns.find((column) =>
        column.items.includes(activeId),
      )
      const destinationColumn = currentColumns.find(
        (column) => column.id === overColumn.id,
      )

      if (!sourceColumn || !destinationColumn) {
        return currentColumns
      }

      const sourceItems = sourceColumn.items.filter((item) => item !== activeId)
      const destinationItems = [...destinationColumn.items]
      const overIndex =
        overId && destinationItems.includes(overId)
          ? destinationItems.indexOf(overId)
          : destinationItems.length

      destinationItems.splice(overIndex, 0, activeId)

      return currentColumns.map((column) => {
        if (column.id === sourceColumn.id) {
          return { ...column, items: sourceItems }
        }

        if (column.id === destinationColumn.id) {
          return { ...column, items: destinationItems }
        }

        return column
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null

    if (!overId) {
      setActiveItemId(null)
      setOverColumnId(null)
      return
    }

    const activeColumn = findColumnByItemId(activeId)
    const overColumn = findColumnByTargetId(overId)

    if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.items.indexOf(activeId)
      const newIndex = overColumn.items.includes(overId)
        ? overColumn.items.indexOf(overId)
        : overColumn.items.length - 1

      if (oldIndex !== newIndex) {
        setColumns((currentColumns) =>
          currentColumns.map((column) =>
            column.id === activeColumn.id
              ? {
                  ...column,
                  items: arrayMove(column.items, oldIndex, newIndex),
                }
              : column,
          ),
        )
      }
    }

    setActiveItemId(null)
    setOverColumnId(null)
  }

  const handleDragCancel = () => {
    setActiveItemId(null)
    setOverColumnId(null)
  }

  const startTitleEdit = (columnId: string) => {
    const targetColumn = columns.find((column) => column.id === columnId)
    if (!targetColumn) {
      return
    }

    setEditingColumnId(columnId)
    setEditingTitleValue(targetColumn.title)
  }

  const commitTitleEdit = (columnId: string) => {
    const nextTitle = editingTitleValue.trim()

    if (!nextTitle) {
      setEditingColumnId(null)
      setEditingTitleValue('')
      return
    }

    setColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId ? { ...column, title: nextTitle } : column,
      ),
    )
    setEditingColumnId(null)
    setEditingTitleValue('')
  }

  const cancelTitleEdit = () => {
    setEditingColumnId(null)
    setEditingTitleValue('')
  }

  const startAddList = () => {
    setIsAddingList(true)
    setNewListTitle('')
  }

  const cancelAddList = () => {
    setIsAddingList(false)
    setNewListTitle('')
  }

  const addList = () => {
    const nextTitle = newListTitle.trim()
    if (!nextTitle) {
      return
    }

    const newColumnId = `list-${Date.now()}`

    setColumns((currentColumns) => [
      ...currentColumns,
      {
        id: newColumnId,
        title: nextTitle,
        items: [],
      },
    ])
    setIsAddingList(false)
    setNewListTitle('')
  }

  const startAddCard = (columnId: string) => {
    setAddingCardColumnId(columnId)
    setNewCardValue('')
  }

  const cancelAddCard = () => {
    setAddingCardColumnId(null)
    setNewCardValue('')
  }

  const addCard = (columnId: string) => {
    const nextCardName = newCardValue.trim()
    if (!nextCardName) {
      return
    }

    setColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId
          ? { ...column, items: [...column.items, nextCardName] }
          : column,
      ),
    )
    setAddingCardColumnId(null)
    setNewCardValue('')
  }

  const startEditCard = (columnId: string, item: string) => {
    setEditingCardKey(getItemKey(columnId, item))
    setEditingCardValue(item)
  }

  const cancelEditCard = () => {
    setEditingCardKey(null)
    setEditingCardValue('')
  }

  const commitEditCard = (columnId: string, item: string) => {
    const nextItemName = editingCardValue.trim()
    if (!nextItemName || nextItemName === item) {
      cancelEditCard()
      return
    }

    const oldKey = getItemKey(columnId, item)
    const newKey = getItemKey(columnId, nextItemName)

    setColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              items: column.items.map((currentItem) =>
                currentItem === item ? nextItemName : currentItem,
              ),
            }
          : column,
      ),
    )
    setCheckedItems((current) => {
      if (!current[oldKey]) {
        return current
      }

      const next = { ...current }
      delete next[oldKey]
      next[newKey] = true
      return next
    })
    setBasketItems((current) => {
      if (!current[oldKey]) {
        return current
      }

      const next = { ...current }
      delete next[oldKey]
      next[newKey] = true
      return next
    })
    cancelEditCard()
  }

  const toggleChecked = (columnId: string, item: string) => {
    const itemKey = getItemKey(columnId, item)
    setCheckedItems((current) => {
      if (current[itemKey]) {
        setBasketItems((basketCurrent) => {
          const nextBasket = { ...basketCurrent }
          delete nextBasket[itemKey]
          return nextBasket
        })
        const next = { ...current }
        delete next[itemKey]
        return next
      }

      return {
        ...current,
        [itemKey]: true,
      }
    })
  }

  const deleteColumn = (columnId: string) => {
    const targetColumn = columns.find((column) => column.id === columnId)
    if (!targetColumn) {
      return
    }

    if (
      targetColumn.items.length > 0 &&
      !window.confirm(
        `「${targetColumn.title}」にはカードが残っています。削除してもいいですか？`,
      )
    ) {
      return
    }

    setColumns((currentColumns) =>
      currentColumns.filter((column) => column.id !== columnId),
    )
    setCheckedItems((current) => {
      const next = { ...current }
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${columnId}::`)) {
          delete next[key]
        }
      })
      return next
    })
    setBasketItems((current) => {
      const next = { ...current }
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${columnId}::`)) {
          delete next[key]
        }
      })
      return next
    })

    if (editingColumnId === columnId) {
      setEditingColumnId(null)
      setEditingTitleValue('')
    }
  }

  const deleteCard = (columnId: string, item: string) => {
    if (!window.confirm(`「${item}」を削除してもいいですか？`)) {
      return
    }

    const itemKey = getItemKey(columnId, item)
    setColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              items: column.items.filter((currentItem) => currentItem !== item),
            }
          : column,
      ),
    )
    setCheckedItems((current) => {
      const next = { ...current }
      delete next[itemKey]
      return next
    })
    setBasketItems((current) => {
      const next = { ...current }
      delete next[itemKey]
      return next
    })
  }

  const selectedItems: ShoppingEntry[] = columns.flatMap((column) =>
    column.items
      .filter((item) => checkedItems[getItemKey(column.id, item)])
      .map((item) => ({
        key: getItemKey(column.id, item),
        item,
        sourceTitle: column.title,
        columnId: column.id,
      })),
  )

  const shoppingItems = selectedItems.filter((entry) => !basketItems[entry.key])
  const basketListItems = selectedItems.filter((entry) => basketItems[entry.key])

  const moveToBasket = (itemKey: string) => {
    setBasketItems((current) => ({
      ...current,
      [itemKey]: true,
    }))
  }

  const moveBackToShopping = (itemKey: string) => {
    setBasketItems((current) => {
      const next = { ...current }
      delete next[itemKey]
      return next
    })
  }

  const completeShopping = () => {
    const basketKeys = Object.keys(basketItems)
    if (basketKeys.length === 0) {
      return
    }

    setBasketItems({})
    setCheckedItems((current) => {
      const next = { ...current }
      basketKeys.forEach((key) => {
        delete next[key]
      })
      return next
    })
  }

  return {
    columns,
    pageMode,
    setPageMode,
    activeItemId,
    overColumnId,
    editingColumnId,
    editingTitleValue,
    setEditingTitleValue,
    addingCardColumnId,
    newCardValue,
    setNewCardValue,
    isAddingList,
    newListTitle,
    setNewListTitle,
    checkedItems,
    editingCardKey,
    editingCardValue,
    setEditingCardValue,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    startTitleEdit,
    commitTitleEdit,
    cancelTitleEdit,
    startAddList,
    cancelAddList,
    addList,
    startAddCard,
    cancelAddCard,
    addCard,
    startEditCard,
    cancelEditCard,
    commitEditCard,
    toggleChecked,
    deleteColumn,
    deleteCard,
    shoppingItems,
    basketListItems,
    moveToBasket,
    moveBackToShopping,
    completeShopping,
  }
}
