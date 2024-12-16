document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const addCocktailButton = document.getElementById('add-cocktail');
    const saveCocktailButton = document.getElementById('save-cocktail');
    const cancelButton = document.getElementById('cancel');
    const backToMenuButton = document.getElementById('back-to-menu');

    const mainContent = document.getElementById('main-content');
    const ingredientPage = document.getElementById('ingredient-page');
    const ingredientTitle = document.getElementById('ingredient-title');
    const ingredientList = document.getElementById('ingredient-list');

    const cocktailList = document.getElementById('cocktail-list');
    const searchBar = document.getElementById('search-bar');

    const defaultCocktails = [
        {
            name: "古典 Old Fashioned",
            recipe: "波本威士忌 60 ml,安格斯特拉苦精 2 滴,方糖 1 块,苏打水 少许"
        },
        {
            name: "尼格罗尼 Negroni",
            recipe: "金酒 30 ml,金巴利 30 ml,甜味美思 30 ml,橙皮 1 片"
        },
        {
            name: "曼哈顿 Manhattan",
            recipe: "黑麦威士忌 60 ml,甜味美思 30 ml,安格斯特拉苦精 2 滴,马拉斯奇诺樱桃 1 颗"
        },
        {
            name: "代基里 Daiquiri",
            recipe: "白朗姆酒 60 ml,青柠汁 30 ml,糖浆 15 ml"
        },
        {
            name: "马天尼 Dry Martini",
            recipe: "金酒 60 ml,干味美思 10 ml,橄榄 1 颗"
        }
    ];

    let cocktails = JSON.parse(localStorage.getItem('cocktails')) || defaultCocktails;

    if (!localStorage.getItem('cocktails')) {
        localStorage.setItem('cocktails', JSON.stringify(defaultCocktails));
    }

    let longPressTimeout = null;

    const renderCocktails = (filter = "") => {
        cocktailList.innerHTML = "";
        const filteredCocktails = cocktails.filter(cocktail =>
            cocktail.name.toLowerCase().includes(filter.toLowerCase())
        );

        filteredCocktails.forEach((cocktail, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${cocktail.name}</h3>
                <button class="delete-button" data-index="${index}">删除</button>
            `;

            let pressTimer;
            let startTime;

            function handlePointerDown(e) {
                startTime = Date.now();
                pressTimer = setTimeout(() => {
                    card.classList.add('show-delete');
                }, 500);
            }

            function handlePointerUp(e) {
                const pressDuration = Date.now() - startTime;
                clearTimeout(pressTimer);
                
                if (pressDuration < 500 && !card.classList.contains('show-delete')) {
                    showIngredientPage(cocktail);
                }
            }

            function handlePointerCancel() {
                clearTimeout(pressTimer);
            }

            // 添加指针事件监听器
            card.addEventListener('pointerdown', handlePointerDown);
            card.addEventListener('pointerup', handlePointerUp);
            card.addEventListener('pointercancel', handlePointerCancel);
            card.addEventListener('pointermove', handlePointerCancel);

            // 删除按钮处理
            const deleteButton = card.querySelector('.delete-button');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除 "${cocktail.name}" 这个配方吗？`)) {
                    cocktails.splice(index, 1);
                    saveCocktailsToStorage();
                    renderCocktails();
                } else {
                    card.classList.remove('show-delete');
                }
            });

            cocktailList.appendChild(card);
        });
    };

    const saveCocktailsToStorage = () => {
        localStorage.setItem('cocktails', JSON.stringify(cocktails));
    };

    const showIngredientPage = (cocktail) => {
        mainContent.style.display = 'none';
        ingredientPage.style.display = 'block';
        ingredientTitle.textContent = cocktail.name;

        ingredientList.innerHTML = "";
        const ingredients = cocktail.recipe.split(',').map(item => {
            const parts = item.trim().split(/\s+/);
            return {
                name: parts[0] || '',
                quantity: parts[1] || '',
                unit: parts[2] || ''
            };
        });

        ingredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.className = 'ingredient-item';
            
            const amountHtml = ingredient.quantity ? 
                `<div class="ingredient-amount">
                    <span class="ingredient-quantity">${ingredient.quantity}</span>
                    <span class="ingredient-unit">${ingredient.unit}</span>
                </div>` : '';

            item.innerHTML = `
                <span class="ingredient-name">${ingredient.name}</span>
                ${amountHtml}
            `;
            ingredientList.appendChild(item);
        });
    };

    // 事件监听器
    addCocktailButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    saveCocktailButton.addEventListener('click', () => {
        const name = document.getElementById('cocktail-name').value;
        const ingredientInputs = document.querySelectorAll('.ingredient-inputs');
        
        if (!name || ingredientInputs.length === 0) {
            alert('请填写鸡尾酒名称和至少一种配料！');
            return;
        }

        const recipe = Array.from(ingredientInputs)
            .map(container => {
                const name = container.querySelector('.ingredient-name').value;
                const quantity = container.querySelector('.ingredient-quantity').value;
                const unit = container.querySelector('.ingredient-unit').value;
                
                if (!name) return null;
                return `${name} ${quantity} ${unit}`.trim();
            })
            .filter(item => item)
            .join(',');

        if (recipe) {
            cocktails.push({ name, recipe });
            saveCocktailsToStorage();
            renderCocktails();

            // 清空表单
            document.getElementById('cocktail-name').value = '';
            const container = document.getElementById('ingredients-container');
            container.innerHTML = `
                <h3>配料清单</h3>
                <div class="ingredient-inputs">
                    <input type="text" class="ingredient-name" placeholder="配料名称">
                    <input type="text" class="ingredient-quantity" placeholder="用量">
                    <input type="text" class="ingredient-unit" placeholder="单位">
                    <button type="button" class="remove-ingredient">×</button>
                </div>
            `;

            modal.classList.add('hidden');
        } else {
            alert('请至少添加一种配料！');
        }
    });

    backToMenuButton.addEventListener('click', () => {
        ingredientPage.style.display = 'none';
        mainContent.style.display = 'block';
    });

    searchBar.addEventListener('input', (event) => {
        renderCocktails(event.target.value);
    });

    // 添加新配料行的功能
    document.getElementById('add-ingredient').addEventListener('click', () => {
        const container = document.createElement('div');
        container.className = 'ingredient-inputs';
        container.innerHTML = `
            <input type="text" class="ingredient-name" placeholder="配料名称">
            <input type="text" class="ingredient-quantity" placeholder="用量">
            <input type="text" class="ingredient-unit" placeholder="单位">
            <button type="button" class="remove-ingredient">×</button>
        `;
        document.getElementById('ingredients-container').appendChild(container);
    });

    // 删除配料行的功能
    document.getElementById('ingredients-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient')) {
            e.target.parentElement.remove();
        }
    });

    // 初始化渲染
    renderCocktails();
});