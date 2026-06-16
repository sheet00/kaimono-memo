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
type CheckedItems = Record<string, true>
type BasketItems = Record<string, true>

const getItemKey = (columnId: string, item: string) => `${columnId}::${item}`

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
  checked,
  onToggleChecked,
  onDeleteCard,
}: {
  columnId: string
  item: string
  checked: boolean
  onToggleChecked: (columnId: string, item: string) => void
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
      <button
        type="button"
        className="item-card-body"
        onClick={() => onToggleChecked(columnId, item)}
      >
        <p className="item-name">{item}</p>
      </button>
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
  checkedItems,
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
  onDeleteCard,
}: {
  column: BoardColumn
  isOver: boolean
  isEditingTitle: boolean
  editingTitleValue: string
  isAddingCard: boolean
  newCardValue: string
  checkedItems: CheckedItems
  onStartTitleEdit: (columnId: string) => void
  onEditingTitleChange: (value: string) => void
  onCommitTitle: (columnId: string) => void
  onCancelTitleEdit: () => void
  onDeleteColumn: (columnId: string) => void
  onStartAddCard: (columnId: string) => void
  onNewCardValueChange: (value: string) => void
  onAddCard: (columnId: string) => void
  onCancelAddCard: () => void
  onToggleChecked: (columnId: string, item: string) => void
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
              checked={Boolean(checkedItems[getItemKey(column.id, item)])}
              onToggleChecked={onToggleChecked}
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
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})
  const [basketItems, setBasketItems] = useState<BasketItems>({})

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

  const selectedItems = columns.flatMap((column) =>
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
                checkedItems={checkedItems}
                onStartTitleEdit={startTitleEdit}
                onEditingTitleChange={setEditingTitleValue}
                onCommitTitle={commitTitleEdit}
                onCancelTitleEdit={cancelTitleEdit}
                onDeleteColumn={deleteColumn}
                onStartAddCard={startAddCard}
                onNewCardValueChange={setNewCardValue}
                onAddCard={addCard}
                onCancelAddCard={cancelAddCard}
                onToggleChecked={toggleChecked}
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
          <div className="shopping-page-board">
            <section className="shopping-page-card">
              <h1>買い物リスト</h1>
              {shoppingItems.length === 0 ? (
                <p>リスト一覧でチェックしたものがここに出ます。</p>
              ) : (
                <div className="shopping-items">
                  {shoppingItems.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      className="shopping-item shopping-item-button"
                      onClick={() => moveToBasket(entry.key)}
                    >
                      <span className="shopping-item-name">{entry.item}</span>
                      <span className="shopping-item-source">{entry.sourceTitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="shopping-page-card">
              <h1>カゴ</h1>
              {basketListItems.length === 0 ? (
                <p>買い物リスト側の項目をタップすると、ここへ入ります。</p>
              ) : (
                <>
                  <div className="shopping-items">
                    {basketListItems.map((entry) => (
                      <button
                        key={entry.key}
                        type="button"
                        className="shopping-item shopping-item-button is-basket"
                        onClick={() => moveBackToShopping(entry.key)}
                      >
                        <span className="shopping-item-name">{entry.item}</span>
                        <span className="shopping-item-source">{entry.sourceTitle}</span>
                      </button>
                    ))}
                  </div>
                  <div className="shopping-complete-area">
                    <button
                      type="button"
                      className="shopping-complete-button"
                      onClick={completeShopping}
                    >
                      買い物完了
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
