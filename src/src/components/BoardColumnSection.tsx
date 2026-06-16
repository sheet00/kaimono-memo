import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KeyboardEvent } from 'react'
import type { BoardColumn, CheckedItems } from '../types/board'
import { SortableItemCard } from './SortableItemCard'

type BoardColumnSectionProps = {
  column: BoardColumn
  isOver: boolean
  isEditingTitle: boolean
  editingTitleValue: string
  isAddingCard: boolean
  newCardValue: string
  checkedItems: CheckedItems
  editingCardKey: string | null
  editingCardValue: string
  onStartTitleEdit: (columnId: string) => void
  onEditingTitleChange: (value: string) => void
  onCommitTitle: (columnId: string) => void
  onCancelTitleEdit: () => void
  onDeleteColumn: (columnId: string) => void
  onStartAddCard: (columnId: string) => void
  onNewCardValueChange: (value: string) => void
  onAddCard: (columnId: string) => void
  onCancelAddCard: () => void
  onToggleChecked: (itemId: string) => void
  onStartEditCard: (columnId: string, itemId: string, currentName: string) => void
  onEditingCardValueChange: (value: string) => void
  onCommitEditCard: (columnId: string, itemId: string) => void
  onCancelEditCard: () => void
  onDeleteCard: (columnId: string, itemId: string) => void
}

export function BoardColumnSection({
  column,
  isOver,
  isEditingTitle,
  editingTitleValue,
  isAddingCard,
  newCardValue,
  checkedItems,
  editingCardKey,
  editingCardValue,
  onStartTitleEdit,
  onEditingTitleChange,
  onCommitTitle,
  onCancelTitleEdit,
  onDeleteColumn,
  onStartAddCard,
  onNewCardValueChange,
  onAddCard,
  onCancelAddCard,
  onToggleChecked,
  onStartEditCard,
  onEditingCardValueChange,
  onCommitEditCard,
  onCancelEditCard,
  onDeleteCard,
}: BoardColumnSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`board-column ${isOver ? 'is-drop-target' : ''}`}
    >
      <header className="column-header">
        <div className="column-title-row">
          <button
            type="button"
            className="column-drag-handle"
            aria-label={`${column.title}を並べ替え`}
            {...attributes}
            {...listeners}
          >
            ☰
          </button>
          {isEditingTitle ? (
            <input
              className="column-title-input"
              value={editingTitleValue}
              onChange={(event) => onEditingTitleChange(event.target.value)}
              onBlur={() => onCommitTitle(column.id)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  onCommitTitle(column.id)
                }

                if (event.key === 'Escape') {
                  onCancelTitleEdit()
                }
              }}
              autoFocus
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : (
            <button
              type="button"
              className="column-title-button"
              onClick={() => onStartTitleEdit(column.id)}
            >
              {column.title}
            </button>
          )}

          <button
            type="button"
            className="column-delete-button"
            onClick={(event) => {
              event.stopPropagation()
              onDeleteColumn(column.id)
            }}
            aria-label={`${column.title}を削除`}
          >
            ×
          </button>
        </div>
      </header>

      <SortableContext
        items={(column.items || []).map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {(column.items || []).map((item) => (
            <SortableItemCard
              key={item.id}
              columnId={column.id}
              item={item}
              checked={Boolean(checkedItems[item.id])}
              isEditing={editingCardKey === item.id}
              editingValue={editingCardValue}
              onToggleChecked={onToggleChecked}
              onStartEditCard={onStartEditCard}
              onEditingCardValueChange={onEditingCardValueChange}
              onCommitEditCard={onCommitEditCard}
              onCancelEditCard={onCancelEditCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
          {(column.items || []).length === 0 ? (
            <div className="empty-column">ここへ移動</div>
          ) : null}
        </div>
      </SortableContext>

      <div className="add-card-area">
        {isAddingCard ? (
          <>
            <input
              className="add-card-input"
              value={newCardValue}
              onChange={(event) => onNewCardValueChange(event.target.value)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  onAddCard(column.id)
                }

                if (event.key === 'Escape') {
                  onCancelAddCard()
                }
              }}
              placeholder="カード名を入力"
              autoFocus
            />
            <div className="add-card-actions">
              <button
                type="button"
                className="confirm-add-card-button"
                onClick={() => onAddCard(column.id)}
              >
                追加
              </button>
              <button
                type="button"
                className="cancel-add-card-button"
                onClick={onCancelAddCard}
              >
                キャンセル
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="open-add-card-button"
            onClick={() => onStartAddCard(column.id)}
          >
            ＋ カード追加
          </button>
        )}
      </div>
    </section>
  )
}
