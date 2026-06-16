import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useState } from 'react'
import { BoardColumnSection } from './components/BoardColumnSection'
import { ShoppingBoard } from './components/ShoppingBoard'
import { initialBoardColumns } from './data/initialBoardColumns'
import { useListBoard } from './hooks/useListBoard'
import { useShoppingBoard } from './hooks/useShoppingBoard'
import './styles/board.css'
import type { BasketItems, CheckedItems, PageMode } from './types/board'

function App() {
  const [columns, setColumns] = useState(initialBoardColumns)
  const [pageMode, setPageMode] = useState<PageMode>('lists')
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})
  const [basketItems, setBasketItems] = useState<BasketItems>({})

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
