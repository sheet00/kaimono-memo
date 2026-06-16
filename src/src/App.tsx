import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { BoardColumnSection } from './components/BoardColumnSection'
import { ShoppingBoard } from './components/ShoppingBoard'
import { useBoardPage } from './hooks/useBoardPage'
import './styles/board.css'

function App() {
  const boardPage = useBoardPage()

  return (
    <main className="board-page">
      <div className="board-toolbar">
        <div className="board-toolbar-nav">
          <button
            type="button"
            className={`top-nav-button ${boardPage.pageMode === 'lists' ? 'is-active' : ''}`}
            onClick={() => boardPage.setPageMode('lists')}
          >
            リスト一覧
          </button>
          <button
            type="button"
            className={`top-nav-button ${boardPage.pageMode === 'shopping' ? 'is-active' : ''}`}
            onClick={() => boardPage.setPageMode('shopping')}
          >
            買い物リスト
          </button>
        </div>
      </div>

      {boardPage.pageMode === 'lists' ? (
        <DndContext
          sensors={boardPage.sensors}
          collisionDetection={closestCorners}
          onDragStart={boardPage.handleDragStart}
          onDragOver={boardPage.handleDragOver}
          onDragEnd={boardPage.handleDragEnd}
          onDragCancel={boardPage.handleDragCancel}
        >
          <section className="board" aria-label="買い物ボード">
            {boardPage.columns.map((column) => (
              <BoardColumnSection
                key={column.id}
                column={column}
                isOver={boardPage.overColumnId === column.id}
                isEditingTitle={boardPage.editingColumnId === column.id}
                editingTitleValue={boardPage.editingTitleValue}
                isAddingCard={boardPage.addingCardColumnId === column.id}
                newCardValue={boardPage.newCardValue}
                checkedItems={boardPage.checkedItems}
                editingCardKey={boardPage.editingCardKey}
                editingCardValue={boardPage.editingCardValue}
                onStartTitleEdit={boardPage.startTitleEdit}
                onEditingTitleChange={boardPage.setEditingTitleValue}
                onCommitTitle={boardPage.commitTitleEdit}
                onCancelTitleEdit={boardPage.cancelTitleEdit}
                onDeleteColumn={boardPage.deleteColumn}
                onStartAddCard={boardPage.startAddCard}
                onNewCardValueChange={boardPage.setNewCardValue}
                onAddCard={boardPage.addCard}
                onCancelAddCard={boardPage.cancelAddCard}
                onToggleChecked={boardPage.toggleChecked}
                onStartEditCard={boardPage.startEditCard}
                onEditingCardValueChange={boardPage.setEditingCardValue}
                onCommitEditCard={boardPage.commitEditCard}
                onCancelEditCard={boardPage.cancelEditCard}
                onDeleteCard={boardPage.deleteCard}
              />
            ))}
            <section className="add-list-column">
              {boardPage.isAddingList ? (
                <div className="add-list-form">
                  <input
                    className="add-list-input"
                    value={boardPage.newListTitle}
                    onChange={(event) => boardPage.setNewListTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        boardPage.addList()
                      }

                      if (event.key === 'Escape') {
                        boardPage.cancelAddList()
                      }
                    }}
                    placeholder="リスト名を入力"
                    autoFocus
                  />
                  <div className="add-list-actions">
                    <button
                      type="button"
                      className="confirm-add-list-button"
                      onClick={boardPage.addList}
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      className="cancel-add-list-button"
                      onClick={boardPage.cancelAddList}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-list-button add-list-column-button"
                  onClick={boardPage.startAddList}
                >
                  リスト追加
                </button>
              )}
            </section>
          </section>

          <DragOverlay>
            {boardPage.activeItemId ? (
              <article className="item-card item-card-overlay">
                <p className="item-name">{boardPage.activeItemId}</p>
              </article>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <ShoppingBoard
          shoppingItems={boardPage.shoppingItems}
          basketItems={boardPage.basketListItems}
          onMoveToBasket={boardPage.moveToBasket}
          onMoveBackToShopping={boardPage.moveBackToShopping}
          onCompleteShopping={boardPage.completeShopping}
        />
      )}
    </main>
  )
}

export default App
