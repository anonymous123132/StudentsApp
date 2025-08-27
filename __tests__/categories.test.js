import { jest } from '@jest/globals';
import { populateCategorySelects, renderCategoryList } from '../js/categories.js';

describe('categories', () => {
  test('populateCategorySelects adds options', () => {
    const categoryInput = document.createElement('select');
    const filterCategory = document.createElement('select');
    const categories = [{ name: 'Work', color: '#f00' }];
    populateCategorySelects(categoryInput, filterCategory, categories);
    expect(categoryInput.options).toHaveLength(2);
    expect(filterCategory.options).toHaveLength(2);
  });

  test('renderCategoryList renders and deletes', () => {
    const categoryList = document.createElement('ul');
    const categories = [{ name: 'Work', color: '#f00' }];
    const saveCategories = jest.fn();
    const populate = jest.fn();
    const applyFilters = jest.fn();
    renderCategoryList(
      categoryList,
      categories,
      saveCategories,
      populate,
      applyFilters
    );
    expect(categoryList.children).toHaveLength(1);
    categoryList.querySelector('button').click();
    expect(categories).toHaveLength(0);
    expect(saveCategories).toHaveBeenCalled();
    expect(populate).toHaveBeenCalled();
    expect(applyFilters).toHaveBeenCalled();
  });
});
