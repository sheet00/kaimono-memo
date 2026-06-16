type ShoppingEntry = {
  key: string
  item: string
  sourceTitle: string
}

type ShoppingBoardProps = {
  shoppingItems: ShoppingEntry[]
  basketItems: ShoppingEntry[]
  onMoveToBasket: (itemKey: string) => void
  onMoveBackToShopping: (itemKey: string) => void
  onCompleteShopping: () => void
}

export function ShoppingBoard({
  shoppingItems,
  basketItems,
  onMoveToBasket,
  onMoveBackToShopping,
  onCompleteShopping,
}: ShoppingBoardProps) {
  return (
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
                  onClick={() => onMoveToBasket(entry.key)}
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
          {basketItems.length === 0 ? (
            <p>買い物リスト側の項目をタップすると、ここへ入ります。</p>
          ) : (
            <>
              <div className="shopping-items">
                {basketItems.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    className="shopping-item shopping-item-button is-basket"
                    onClick={() => onMoveBackToShopping(entry.key)}
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
                  onClick={onCompleteShopping}
                >
                  買い物完了
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
