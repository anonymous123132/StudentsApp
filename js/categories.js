export function populateCategorySelects(categoryInput, filterCategory, categories) {
  categoryInput.innerHTML = '<option value="">None</option>';
  filterCategory.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    opt.dataset.color = c.color;
    categoryInput.appendChild(opt);
    const fOpt = document.createElement('option');
    fOpt.value = c.name;
    fOpt.textContent = c.name;
    filterCategory.appendChild(fOpt);
  });
}

export function renderCategoryList(categoryList, categories, saveCategories, populateCategorySelectsFn, applyFiltersFn) {
  categoryList.innerHTML = '';
  categories.forEach((c, idx) => {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.style.background = c.color;
    swatch.style.display = 'inline-block';
    swatch.style.width = '12px';
    swatch.style.height = '12px';
    swatch.style.marginRight = '6px';
    li.appendChild(swatch);
    li.appendChild(document.createTextNode(c.name + ' '));
    const del = document.createElement('button');
    del.textContent = 'X';
    del.addEventListener('click', () => {
      categories.splice(idx, 1);
      saveCategories(categories);
      populateCategorySelectsFn();
      renderCategoryList(categoryList, categories, saveCategories, populateCategorySelectsFn, applyFiltersFn);
      applyFiltersFn();
    });
    li.appendChild(del);
    categoryList.appendChild(li);
  });
}
