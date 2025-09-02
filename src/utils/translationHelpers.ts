// Helper function to get translated envelope name
export function getTranslatedEnvelopeName(name: string, t: (key: string) => string): string {
  // Map common English category names to translation keys
  const categoryMap: Record<string, string> = {
    'Groceries': 'categories.groceries',
    'Rent/Utilities': 'categories.rentUtilities',
    'Restaurants': 'categories.restaurants',
    'Travel': 'categories.travel',
    'Transport': 'categories.transport',
    'Education': 'categories.education',
    'Gifts': 'categories.gifts',
    'Health': 'categories.health',
    'Entertainment': 'categories.entertainment',
    'Shopping': 'categories.shopping',
    'Subscriptions': 'categories.subscriptions',
    'Earned Income': 'categories.earnedIncome',
    'Profit Income': 'categories.profitIncome',
    'Interest Income': 'categories.interestIncome',
    'Dividend Income': 'categories.dividendIncome',
    'Rental Income': 'categories.rentalIncome',
    'Capital Gains': 'categories.capitalGains',
    'Royalty Income': 'categories.royaltyIncome',
    'Licensing Income': 'categories.licensingIncome',
    'Portfolio Income': 'categories.portfolioIncome',
    'New Category': 'categories.newCategory',
  };

  const translationKey = categoryMap[name];
  if (translationKey) {
    return t(translationKey);
  }

  // If no translation found, return the original name
  return name;
}
