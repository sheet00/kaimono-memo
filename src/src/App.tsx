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

type PageMode = 'lists' | 'shopping'

const initialBoardColumns: BoardColumn[] = [
  {
    id: 'fridge',
    title: '冷蔵庫',
    items: [
      'ヨーグルト',
      '麦茶',
      'のむヨーグルト',
      'なす',
      'おみそ汁',
      '玉ねぎ',
      'スープ',
      'ジャム',
      'パン',
      'マーガリン',
      'ツナ缶',
      'オリーブオイル',
      'みそ',
      'にんにく',
      '牛乳',
      'たまご',
      'キャベツ',
      'マヨネーズ',
      'キムチ',
      '豆腐',
      '卵',
      '納豆',
      'にんじん',
      'ドレッシング',
      'チーズ',
      '鮭',
      'きゅうり',
      'ニラ',
    ],
  },
  {
    id: 'daily-necessities',
    title: '生活品',
    items: [
      '化粧水',
      'お風呂洗剤',
      'ゴミ袋(30L大)',
      '犬おやつ',
      '洗濯洗剤',
      'リンス',
      'アルミホイル',
      'お茶パック',
      'にんにくチューブ',
      'せっけん',
      'ラップ',
      'キッチンペーパー',
      '単2電池',
      'シャンプー',
      '玄関芳香剤',
      '歯磨き粉',
      'ビニール袋',
      'トイレットペーパー',
      '重曹',
      '柔軟剤',
      '洗顔',
      '流し漂白',
      '漂白剤',
    ],
  },
  {
    id: 'occasional',
    title: 'たまに買う',
    items: [
      'コーヒーフィルター',
      'CR2032',
      '醤油',
      'かつおぶし、あげだま',
      '歯磨き粉',
      'めんつゆ',
      'レモン果汁',
      '山椒',
      '砂糖',
      'クッキングシート',
      'ココナツミルク',
      'はちみつ',
      'お茶',
      'お好み焼きソース',
      'ケチャップ',
      'ミロ',
      'ハイター',
      'クイックルワイパー',
      'コーヒー',
      'ピザ用チーズ',
      'こめ',
      'のどあめ',
      'タバスコ',
      '白ワイン、赤ワイン',
      '爪楊枝',
      'ロキソニン',
      'どら焼き',
    ],
  },
]

function SortableItemCard({
  columnId,
  item,
  onDeleteCard,
}: {
  columnId: string
  item: string
  onDeleteCard: (columnId: string, item: string) => void
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
    >
      <button
        type="button"
        className="item-delete-button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onDeleteCard(columnId, item)
        }}
        aria-label={`${item}を削除`}
      >
        ×
      </button>
      <div className="item-card-body" {...attributes} {...listeners}>
        <p className="item-name">{item}</p>
      </div>
    </article>
  )
}

function BoardColumnSection({
  column,
  isOver,
  isEditingTitle,
  editingTitleValue,
  isAddingCard,
  newCardValue,
  onStartTitleEdit,
  onEditingTitleChange,
  onCommitTitle,
  onCancelTitleEdit,
  onDeleteColumn,
  onStartAddCard,
  onNewCardValueChange,
  onAddCard,
  onCancelAddCard,
  onDeleteCard,
}: {
  column: BoardColumn
  isOver: boolean
  isEditingTitle: boolean
  editingTitleValue: string
  isAddingCard: boolean
  newCardValue: string
  onStartTitleEdit: (columnId: string) => void
  onEditingTitleChange: (value: string) => void
  onCommitTitle: (columnId: string) => void
  onCancelTitleEdit: () => void
  onDeleteColumn: (columnId: string) => void
  onStartAddCard: (columnId: string) => void
  onNewCardValueChange: (value: string) => void
  onAddCard: (columnId: string) => void
  onCancelAddCard: () => void
  onDeleteCard: (columnId: string, item: string) => void
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
        <div className="column-title-row">
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
        items={column.items}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {column.items.map((item) => (
            <SortableItemCard
              key={item}
              columnId={column.id}
              item={item}
              onDeleteCard={onDeleteCard}
            />
          ))}
          {column.items.length === 0 ? (
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

function App() {
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

    if (editingColumnId === columnId) {
      setEditingColumnId(null)
      setEditingTitleValue('')
    }
  }

  const deleteCard = (columnId: string, item: string) => {
    if (!window.confirm(`「${item}」を削除してもいいですか？`)) {
      return
    }

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
      </div>

      {pageMode === 'lists' ? (
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
                isAddingCard={addingCardColumnId === column.id}
                newCardValue={newCardValue}
                onStartTitleEdit={startTitleEdit}
                onEditingTitleChange={setEditingTitleValue}
                onCommitTitle={commitTitleEdit}
                onCancelTitleEdit={cancelTitleEdit}
                onDeleteColumn={deleteColumn}
                onStartAddCard={startAddCard}
                onNewCardValueChange={setNewCardValue}
                onAddCard={addCard}
                onCancelAddCard={cancelAddCard}
                onDeleteCard={deleteCard}
              />
            ))}
            <section className="add-list-column">
              {isAddingList ? (
                <div className="add-list-form">
                  <input
                    className="add-list-input"
                    value={newListTitle}
                    onChange={(event) => setNewListTitle(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === 'Enter') {
                        addList()
                      }

                      if (event.key === 'Escape') {
                        cancelAddList()
                      }
                    }}
                    placeholder="リスト名を入力"
                    autoFocus
                  />
                  <div className="add-list-actions">
                    <button
                      type="button"
                      className="confirm-add-list-button"
                      onClick={addList}
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      className="cancel-add-list-button"
                      onClick={cancelAddList}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-list-button add-list-column-button"
                  onClick={startAddList}
                >
                  リスト追加
                </button>
              )}
            </section>
          </section>

          <DragOverlay>
            {activeItemId ? (
              <article className="item-card item-card-overlay">
                <p className="item-name">{activeItemId}</p>
              </article>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <section className="shopping-page" aria-label="買い物リスト画面">
          <div className="shopping-page-card">
            <h1>買い物リスト</h1>
            <p>ここは別画面です。次に買い物中 UI を作れます。</p>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
