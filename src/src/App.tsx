import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'
import { BoardColumnSection } from './components/BoardColumnSection'
import { ShoppingBoard } from './components/ShoppingBoard'
import { useListBoard } from './hooks/useListBoard'
import { useShoppingBoard } from './hooks/useShoppingBoard'
import './styles/board.css'
import type { BasketItems, CheckedItems, PageMode, BoardColumn } from './types/board'

const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : ''

const listKey = (() => {
  const params = new URLSearchParams(window.location.search)
  let key = params.get('list')
  if (!key) {
    key = crypto.randomUUID()
    params.set('list', key)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }
  return key
})()

function App() {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [pageMode, setPageMode] = useState<PageMode>('lists')
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})
  const [basketItems, setBasketItems] = useState<BasketItems>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/app-state`, {
          headers: {
            'x-list-key': listKey,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()

        const rawLists = data.lists ?? []
        const rawChecked = data.checkedItems ?? {}
        const rawBasket = data.basketItems ?? {}

        const itemKeyToUuidMap = new Map<string, string>()

        const migratedLists = rawLists.map((col: any) => {
          if (!col) return null
          const items = (col.items ?? [])
            .map((item: any) => {
              if (!item) return null
              if (typeof item === 'string') {
                const uuid = crypto.randomUUID()
                const oldKey = `${col.id}::${item}`
                itemKeyToUuidMap.set(oldKey, uuid)
                return { id: uuid, name: item }
              }
              if (typeof item === 'object' && item.id && item.name) {
                return { id: String(item.id), name: String(item.name) }
              }
              return { id: crypto.randomUUID(), name: String(item) }
            })
            .filter(Boolean)
          return {
            id: col.id || `list-${Date.now()}`,
            title: col.title || '無題のリスト',
            items
          }
        }).filter(Boolean)

        const migratedCheckedItems: Record<string, true> = {}
        const migratedBasketItems: Record<string, true> = {}

        Object.keys(rawChecked).forEach((key) => {
          if (rawChecked[key]) {
            if (itemKeyToUuidMap.has(key)) {
              const newUuid = itemKeyToUuidMap.get(key)!
              migratedCheckedItems[newUuid] = true
            } else {
              migratedCheckedItems[key] = true
            }
          }
        })

        Object.keys(rawBasket).forEach((key) => {
          if (rawBasket[key]) {
            if (itemKeyToUuidMap.has(key)) {
              const newUuid = itemKeyToUuidMap.get(key)!
              migratedBasketItems[newUuid] = true
            } else {
              migratedBasketItems[key] = true
            }
          }
        })

        setColumns(migratedLists)
        setCheckedItems(migratedCheckedItems)
        setBasketItems(migratedBasketItems)
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to fetch app state:', error)
      }
    }

    loadAppState()
  }, [])


  useEffect(() => {
    if (!isLoaded) return

    const saveAppState = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/app-state`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-list-key': listKey,
          },
          body: JSON.stringify({
            lists: columns.map((col) => ({
              id: col.id,
              title: col.title,
              items: col.items,
            })),
            checkedItems,
            basketItems,
          }),
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to save app state:', error)
      }
    }

    saveAppState()
  }, [columns, checkedItems, basketItems, isLoaded])



  const listBoard = useListBoard({
    columns,
    setColumns,
    setCheckedItems,
    setBasketItems,
  })
  const shoppingBoard = useShoppingBoard({
    columns,
    checkedItems,
    basketItems,
    setCheckedItems,
    setBasketItems,
  })

  const activeItemName = (() => {
    if (!listBoard.activeItemId) return null
    for (const col of columns) {
      if (!col.items) continue
      const found = col.items.find((item) => item.id === listBoard.activeItemId)
      if (found) return found.name
    }
    return null
  })()

  const activeColumnTitle = (() => {
    if (!listBoard.activeItemId) return null
    const found = columns.find((col) => col.id === listBoard.activeItemId)
    return found ? found.title : null
  })()



  const handleExport = () => {
    const exportData = {
      lists: columns.map((col) => ({
        id: col.id,
        title: col.title,
        items: col.items || [],
      })),
      checkedItems,
      basketItems,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const timestamp = `${dateStr}-${timeStr}`
    const a = document.createElement('a')
    a.href = url
    a.download = `kaimono-memo-${listKey}-${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="board-page">
      <div className="board-toolbar">
        <div className="board-toolbar-nav">
          <button
            type="button"
            className={`top-nav-button ${pageMode === 'lists' && listKey !== 'sample' ? 'is-active' : ''}`}
            onClick={() => setPageMode('lists')}
          >
            リスト一覧
          </button>
          <button
            type="button"
            className={`top-nav-button ${pageMode === 'shopping' && listKey !== 'sample' ? 'is-active' : ''}`}
            onClick={() => setPageMode('shopping')}
          >
            買い物リスト
          </button>
        </div>
        <button
          type="button"
          className="top-nav-button"
          style={{ marginLeft: 'auto' }}
          onClick={handleExport}
        >
          エクスポート
        </button>
        <button
          type="button"
          className={`top-nav-button ${listKey === 'sample' ? 'is-active' : ''}`}
          onClick={() => {
            window.location.href = '?list=sample'
          }}
        >
          サンプル
        </button>
      </div>

       {pageMode === 'lists' ? (
        <DndContext
          sensors={listBoard.sensors}
          collisionDetection={closestCorners}
          onDragStart={listBoard.handleDragStart}
          onDragOver={listBoard.handleDragOver}
          onDragEnd={listBoard.handleDragEnd}
          onDragCancel={listBoard.handleDragCancel}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <section className="board" aria-label="買い物ボード">
              {columns.map((column) => (
                <BoardColumnSection
                  key={column.id}
                  column={column}
                  isOver={listBoard.overColumnId === column.id}
                  isEditingTitle={listBoard.editingColumnId === column.id}
                  editingTitleValue={listBoard.editingTitleValue}
                  isAddingCard={listBoard.addingCardColumnId === column.id}
                  newCardValue={listBoard.newCardValue}
                  checkedItems={checkedItems}
                  editingCardKey={listBoard.editingCardKey}
                  editingCardValue={listBoard.editingCardValue}
                  onStartTitleEdit={listBoard.startTitleEdit}
                  onEditingTitleChange={listBoard.setEditingTitleValue}
                  onCommitTitle={listBoard.commitTitleEdit}
                  onCancelTitleEdit={listBoard.cancelTitleEdit}
                  onDeleteColumn={listBoard.deleteColumn}
                  onStartAddCard={listBoard.startAddCard}
                  onNewCardValueChange={listBoard.setNewCardValue}
                  onAddCard={listBoard.addCard}
                  onCancelAddCard={listBoard.cancelAddCard}
                  onToggleChecked={shoppingBoard.toggleChecked}
                onStartEditCard={listBoard.startEditCard}
                onEditingCardValueChange={listBoard.setEditingCardValue}
                onCommitEditCard={listBoard.commitEditCard}
                onCancelEditCard={listBoard.cancelEditCard}
                onDeleteCard={listBoard.deleteCard}
              />
            ))}
            <section className="add-list-column">
              {listBoard.isAddingList ? (
                <div className="add-list-form">
                  <input
                    className="add-list-input"
                    value={listBoard.newListTitle}
                    onChange={(event) => listBoard.setNewListTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        listBoard.addList()
                      }

                      if (event.key === 'Escape') {
                        listBoard.cancelAddList()
                      }
                    }}
                    placeholder="リスト名を入力"
                    autoFocus
                  />
                  <div className="add-list-actions">
                    <button
                      type="button"
                      className="confirm-add-list-button"
                      onClick={listBoard.addList}
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      className="cancel-add-list-button"
                      onClick={listBoard.cancelAddList}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-list-button add-list-column-button"
                  onClick={listBoard.startAddList}
                >
                  リスト追加
                </button>
              )}
            </section>
          </section>
        </SortableContext>

          <DragOverlay>
            {activeColumnTitle ? (
              <div className="board-column board-column-overlay" style={{ width: '18.5rem', opacity: 0.8 }}>
                <header className="column-header">
                  <div className="column-title-row">
                    <span className="column-title-button">{activeColumnTitle}</span>
                  </div>
                </header>
              </div>
            ) : listBoard.activeItemId ? (
              <article className="item-card item-card-overlay">
                <p className="item-name">{activeItemName}</p>
              </article>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <ShoppingBoard
          shoppingItems={shoppingBoard.shoppingItems}
          basketItems={shoppingBoard.basketListItems}
          onMoveToBasket={shoppingBoard.moveToBasket}
          onMoveBackToShopping={shoppingBoard.moveBackToShopping}
          onCompleteShopping={shoppingBoard.completeShopping}
        />
      )}
    </main>
  )
}

export default App
