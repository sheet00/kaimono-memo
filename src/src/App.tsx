import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import { BoardColumnSection } from './components/BoardColumnSection'
import { ShoppingBoard } from './components/ShoppingBoard'
import { useListBoard } from './hooks/useListBoard'
import { useShoppingBoard } from './hooks/useShoppingBoard'
import './styles/board.css'
import type { BasketItems, CheckedItems, PageMode, BoardColumn } from './types/board'

const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : ''

function App() {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [pageMode, setPageMode] = useState<PageMode>('lists')
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})
  const [basketItems, setBasketItems] = useState<BasketItems>({})
  const [healthStatus, setHealthStatus] = useState('未確認')
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/app-state`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()

        const mappedColumns: BoardColumn[] = data.lists.map((list: any) => ({
          id: list.id,
          title: list.name,
          items: list.items.map((item: any) => item.name),
        }))
        setColumns(mappedColumns)

        const mappedChecked: CheckedItems = {}
        const allSelected = [...data.shoppingItems, ...data.basketItems]
        for (const item of allSelected) {
          mappedChecked[`${item.source_list_id}::${item.name}`] = true
        }
        setCheckedItems(mappedChecked)

        const mappedBasket: BasketItems = {}
        for (const item of data.basketItems) {
          mappedBasket[`${item.source_list_id}::${item.name}`] = true
        }
        setBasketItems(mappedBasket)
      } catch (error) {
        console.error('Failed to fetch app state:', error)
      }
    }

    loadAppState()
  }, [])


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

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true)
    setHealthStatus('確認中...')

    try {
      const response = await fetch(`${API_BASE}/api/health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = (await response.json()) as { ok?: boolean }
      setHealthStatus(data.ok ? 'OK' : '異常')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'request failed'
      setHealthStatus(`失敗: ${message}`)
    } finally {
      setIsCheckingHealth(false)
    }
  }

  return (
    <main className="board-page">
      <div className="board-toolbar">
        <div className="board-toolbar-nav">
          <button
            type="button"
            className={`top-nav-button ${pageMode === 'lists' ? 'is-active' : ''}`}
            onClick={() => setPageMode('lists')}
          >
            リスト一覧
          </button>
          <button
            type="button"
            className={`top-nav-button ${pageMode === 'shopping' ? 'is-active' : ''}`}
            onClick={() => setPageMode('shopping')}
          >
            買い物リスト
          </button>
        </div>
        <div className="health-check-panel">
          <button
            type="button"
            className="health-check-button"
            onClick={handleHealthCheck}
            disabled={isCheckingHealth}
          >
            {isCheckingHealth ? '確認中...' : 'ヘルスチェック'}
          </button>
          <p className="health-check-status">{healthStatus}</p>
        </div>
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

          <DragOverlay>
            {listBoard.activeItemId ? (
              <article className="item-card item-card-overlay">
                <p className="item-name">{listBoard.activeItemId}</p>
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
