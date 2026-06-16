import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KeyboardEvent } from 'react'
import type { BoardItem } from '../types/board'

type SortableItemCardProps = {
  columnId: string
  item: BoardItem
  checked: boolean
  isEditing: boolean
  editingValue: string
  onToggleChecked: (itemId: string) => void
  onStartEditCard: (columnId: string, itemId: string, currentName: string) => void
  onEditingCardValueChange: (value: string) => void
  onCommitEditCard: (columnId: string, itemId: string) => void
  onCancelEditCard: () => void
  onDeleteCard: (columnId: string, itemId: string) => void
}

export function SortableItemCard({
  columnId,
  item,
  checked,
  isEditing,
  editingValue,
  onToggleChecked,
  onStartEditCard,
  onEditingCardValueChange,
  onCommitEditCard,
  onCancelEditCard,
  onDeleteCard,
}: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      columnId,
      itemId: item.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`item-card ${isDragging ? 'is-dragging' : ''} ${
        checked ? 'is-checked' : ''
      }`}
    >
      <button
        type="button"
        className="item-drag-handle"
        aria-label={`${item.name}を並べ替え`}
        onPointerDown={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        className="item-edit-button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onStartEditCard(columnId, item.id, item.name)
        }}
        aria-label={`${item.name}を編集`}
      >
        ✎
      </button>
      {isEditing ? (
        <div className="item-edit-form">
          <input
            className="item-name-input"
            value={editingValue}
            onChange={(event) => onEditingCardValueChange(event.target.value)}
            onBlur={() => onCommitEditCard(columnId, item.id)}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                onCommitEditCard(columnId, item.id)
              }

              if (event.key === 'Escape') {
                onCancelEditCard()
              }
            }}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="item-edit-actions">
            <button
              type="button"
              className="item-edit-delete-button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onDeleteCard(columnId, item.id)}
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="item-card-body"
          onClick={() => onToggleChecked(item.id)}
        >
          <p className="item-name">{item.name}</p>
        </button>
      )}
    </article>
  )
}
