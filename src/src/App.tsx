import './styles/board.css'

const boardColumns = [
  {
    id: 'template',
    title: 'テンプレート',
    subtitle: 'よく買う定番',
    items: ['牛乳', '卵', '食パン', '納豆', 'マヨネーズ'],
  },
  {
    id: 'today',
    title: '今日の買い物',
    subtitle: 'これから買うもの',
    items: ['鶏もも肉', 'ヨーグルト', 'トイレットペーパー', 'バナナ'],
  },
  {
    id: 'basket',
    title: 'カゴに入れた',
    subtitle: '仮チェック済み',
    items: ['にんじん', '玉ねぎ', '豆腐'],
  },
]

function App() {
  return (
    <main className="board-page">
      <section className="board" aria-label="買い物ボード">
        {boardColumns.map((column) => (
          <section key={column.id} className="board-column">
            <header className="column-header">
              <div>
                <h2>{column.title}</h2>
                <p>{column.subtitle}</p>
              </div>
              <span className="column-count">{column.items.length}</span>
            </header>

            <div className="column-cards">
              {column.items.map((item) => (
                <article key={`${column.id}-${item}`} className="item-card">
                  <p className="item-name">{item}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}

export default App
