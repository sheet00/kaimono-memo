import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type KeyboardEvent } from 'react'
import './styles/board.css'

type BoardColumn = {
  id: string
  title: string
  items: string[]
}

const initialBoardColumns: BoardColumn[] = [
  {
    id: 'template',
    title: 'テンプレート',
    items: ['牛乳', '卵', '食パン', '納豆', 'マヨネーズ'],
  },
  {
    id: 'today',
    title: '今日の買い物',
    items: ['鶏もも肉', 'ヨーグルト', 'トイレットペーパー', 'バナナ'],
  },
  {
    id: 'basket',
    title: 'カゴに入れた',
    items: ['にんじん', '玉ねぎ', '豆腐'],
  },
]

function SortableItemCard({
  columnId,
  item,
}: {
  columnId: string
  item: string
}) {
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
      className={`item-card ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <p className="item-name">{item}</p>
    </article>
  )
}

function BoardColumnSection({
  column,
  isOver,
  isEditingTitle,
  editingTitleValue,
  onStartTitleEdit,
  onEditingTitleChange,
  onCommitTitle,
  onCancelTitleEdit,
}: {
  column: BoardColumn
  isOver: boolean
  isEditingTitle: boolean
  editingTitleValue: string
  onStartTitleEdit: (columnId: string) => void
  onEditingTitleChange: (value: string) => void
  onCommitTitle: (columnId: string) => void
  onCancelTitleEdit: () => void
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  return (
    <section
      ref={setNodeRef}
      className={`board-column ${isOver ? 'is-drop-target' : ''}`}
    >
      <header className="column-header">
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
      </header>

      <SortableContext
        items={column.items}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {column.items.map((item) => (
            <SortableItemCard key={item} columnId={column.id} item={item} />
          ))}
          {column.items.length === 0 ? (
            <div className="empty-column">ここへ移動</div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

function App() {
  const [columns, setColumns] = useState(initialBoardColumns)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState('')

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

  return (
    <main className="board-page">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveItemId(null)
          setOverColumnId(null)
        }}
      >
        <section className="board" aria-label="買い物ボード">
          {columns.map((column) => (
            <BoardColumnSection
              key={column.id}
              column={column}
              isOver={overColumnId === column.id}
              isEditingTitle={editingColumnId === column.id}
              editingTitleValue={editingTitleValue}
              onStartTitleEdit={startTitleEdit}
              onEditingTitleChange={setEditingTitleValue}
              onCommitTitle={commitTitleEdit}
              onCancelTitleEdit={cancelTitleEdit}
            />
          ))}
        </section>

        <DragOverlay>
          {activeItemId ? (
            <article className="item-card item-card-overlay">
              <p className="item-name">{activeItemId}</p>
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  )
}

export default App
