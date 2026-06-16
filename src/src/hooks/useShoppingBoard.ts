import { useMemo } from "react";
import type {
  BasketItems,
  BoardColumn,
  CheckedItems,
  ShoppingEntry,
} from "../types/board";
import { getItemKey } from "../utils/getItemKey";

type UseShoppingBoardParams = {
  columns: BoardColumn[];
  checkedItems: CheckedItems;
  basketItems: BasketItems;
  setCheckedItems: React.Dispatch<React.SetStateAction<CheckedItems>>;
  setBasketItems: React.Dispatch<React.SetStateAction<BasketItems>>;
};

/**
 * 買い物リスト画面で使う状態派生値と操作をまとめるフック。
 *
 * リスト一覧で選択されたカードから、買い物リスト用の表示データを組み立て、
 * 「買い物リスト -> カゴ -> 完了」の移動処理を提供する。
 *
 * `columns` 自体は変更せず、`checkedItems` と `basketItems` を使って
 * 買い物中の状態だけを制御する。
 *
 * @param params 共有される列データ、選択状態、カゴ状態、およびそれぞれの更新関数。
 * @returns 買い物リスト画面の表示用データと、項目移動・完了処理の handler。
 */
export function useShoppingBoard({
  columns,
  checkedItems,
  basketItems,
  setCheckedItems,
  setBasketItems,
}: UseShoppingBoardParams) {
  const selectedItems: ShoppingEntry[] = useMemo(
    () =>
      columns.flatMap((column) =>
        column.items
          .filter((item) => checkedItems[getItemKey(column.id, item)])
          .map((item) => ({
            key: getItemKey(column.id, item),
            item,
            sourceTitle: column.title,
            columnId: column.id,
          })),
      ),
    [columns, checkedItems],
  );

  const shoppingItems = selectedItems.filter(
    (entry) => !basketItems[entry.key],
  );
  const basketListItems = selectedItems.filter(
    (entry) => basketItems[entry.key],
  );

  const toggleChecked = (columnId: string, item: string) => {
    const itemKey = getItemKey(columnId, item);
    setCheckedItems((current) => {
      if (current[itemKey]) {
        setBasketItems((basketCurrent) => {
          const nextBasket = { ...basketCurrent };
          delete nextBasket[itemKey];
          return nextBasket;
        });
        const next = { ...current };
        delete next[itemKey];
        return next;
      }

      return {
        ...current,
        [itemKey]: true,
      };
    });
  };

  const moveToBasket = (itemKey: string) => {
    setBasketItems((current) => ({
      ...current,
      [itemKey]: true,
    }));
  };

  const moveBackToShopping = (itemKey: string) => {
    setBasketItems((current) => {
      const next = { ...current };
      delete next[itemKey];
      return next;
    });
  };

  const completeShopping = () => {
    const basketKeys = Object.keys(basketItems);
    if (basketKeys.length === 0) {
      return;
    }

    setBasketItems({});
    setCheckedItems((current) => {
      const next = { ...current };
      basketKeys.forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  return {
    shoppingItems,
    basketListItems,
    toggleChecked,
    moveToBasket,
    moveBackToShopping,
    completeShopping,
  };
}
