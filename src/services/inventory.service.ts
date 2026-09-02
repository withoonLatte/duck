export class InventoryDomainService {
  /**
   * Computes Delta Recipe Consumption when editing an order
   */
  static calculateDeltaConsumption(
    previousQty: number,
    newQty: number,
    recipeItems: { ingredientId: string; quantityPerPortion: number }[]
  ) {
    const deltaQty = newQty - previousQty;

    return recipeItems.map((recipe) => ({
      ingredientId: recipe.ingredientId,
      quantityDelta: deltaQty * recipe.quantityPerPortion,
    }));
  }
}
