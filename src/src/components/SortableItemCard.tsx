import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KeyboardEvent } from 'react'

type SortableItemCardProps = {
  columnId: string
  item: string
  checked: boolean
  isEditing: boolean
  editingValue: string
  onToggleChecked: (columnId: string, item: string) => void
  onStartEditCard: (columnId: string, item: string) => void
  onEditingCardValueChange: (value: string) => void
  onCommitEditCard: (columnId: string, item: string) => void
  onCancelEditCard: () => void
  onDeleteCard: (columnId: string, item: string) => void
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
    id: item,
    data: {
      type: 'item',
      columnId,
      item,
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
        aria-label={`${item}を並べ替え`}
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
          onStartEditCard(columnId, item)
        }}
        aria-label={`${item}を編集`}
      >
        ✎
      </button>
      {isEditing ? (
        <div className="item-edit-form">
          <input
            className="item-name-input"
            value={editingValue}
            onChange={(event) => onEditingCardValueChange(event.target.value)}
            onBlur={() => onCommitEditCard(columnId, item)}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                onCommitEditCard(columnId, item)
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
              onClick={() => onDeleteCard(columnId, item)}
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="item-card-body"
          onClick={() => onToggleChecked(columnId, item)}
        >
          <p className="item-name">{item}</p>
        </button>
      )}
    </article>
  )
}
