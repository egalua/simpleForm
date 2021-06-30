'use strict';
window.addEventListener('load', function(){
    // классы для взаимодействия стилизованного select с js
    let option = {
        containerClass: 'region-list-wrapper',
        selectID: 'order-form-region',
        optionDisableClass: 'order-form__field_clean',
        iconClassList: ['order-form__field_ru', 'order-form__field_kz', 'order-form__field_by'],
        listClass: 'order-form__region-list',
        itemListClass: 'order-form__region-item',
        classOfHoveredItem: 'order-form__region-item_hover',
        capeClass: 'select-cape'
    };
    
    /**
     * Класс для стилизации select и замены блоков option
     */
    class CustomSelect{
        constructor(options){
            this.containerClass = options.containerClass;
            this.selectID = options.selectID;
            this.optionDisableClass = options.optionDisableClass;
            this.iconClassList = options.iconClassList;
            this.listClass = options.listClass;
            this.itemListClass = options.itemListClass;
            this.classOfHoveredItem = options.classOfHoveredItem;
            this.capeClass = options.capeClass;

            // инициализация
            // общий контейнер
            this.selectBox = document.querySelector('.' + this.containerClass);
            // элемент select
            this.select = this.selectBox.querySelector('#' + this.selectID);
            // коллекция элементов списка заменяющих список option, элемента select
            this.itemsList = this.selectBox.querySelectorAll('.' + this.itemListClass);
            // сам список ul элементов, заменяющих список option
            this.list = this.selectBox.querySelector('.' + this.listClass);

            // создать "накладку" над select для перехвата событий click
            this.createCape();

            // отключить option элементы у select
            if (!this.select.classList.contains(this.optionDisableClass)){
                this.select.classList.add(this.optionDisableClass);
            }
            // установить selected элемент
            this._setInitSelectOption();
            // установить обработчики событий
            this.setHandlers();

        }
        /**
         * Создаёт "накладку" над select для перехвата событий click
         */
        createCape(){
            this.selectCape = document.createElement('div');
            this.selectCape.style.position = "absolute";
            this.selectCape.style.marginBottom = "auto";
            this.selectCape.style.marginTop = "auto";
            this.selectCape.style.marginLeft = "auto";
            this.selectCape.style.marginRight = "auto";
            this.selectCape.style.top = "0";
            this.selectCape.style.bottom = "0";
            this.selectCape.style.left = "0";
            this.selectCape.style.right = "0";

            this.selectCape.classList.add(this.capeClass);

            this.selectBox.appendChild(this.selectCape);
        }
        /**
         * Устанавливает обработчики событий
         */
        setHandlers(){
            
            const openListHandler = this.openListHandler.bind(this);
            this.selectBox.addEventListener('keydown', openListHandler);
            this.selectBox.addEventListener('click', openListHandler);

            const closeWithSaveListHandler = this.closeWithSaveListHandler.bind(this);
            this.selectBox.addEventListener('click', closeWithSaveListHandler);
            this.selectBox.addEventListener('keydown', closeWithSaveListHandler);

            const moveBacklightHandler = this.moveBacklightHandler.bind(this);
            this.selectBox.addEventListener('keydown', moveBacklightHandler);

            const closeWithoutSaveListHandler = this.closeWithoutSaveListHandler.bind(this);
            window.addEventListener('keydown', closeWithoutSaveListHandler);
            window.addEventListener('click', closeWithoutSaveListHandler);

            const hoverHandler = this.hoverHandler.bind(this);
            for(let i = 0; i < this.itemsList.length; i++){
                this.itemsList[i].addEventListener('mouseenter', hoverHandler);
            }
        }

        /**
         * Обработчик событий открытия списка
         * @param {Event} event объект события
         */
        openListHandler(event){
            let target = event.target;
            let isCloseList = window.getComputedStyle(this.list).display == "none";
            
            if(event.type == 'keydown'){
                let keyCode = event.code;
                
                target = target.closest('#' + this.selectID);

                if( target == this.select && 
                    isCloseList && 
                    (keyCode == 'Space' || keyCode == 'Enter') ){
                    
                    event.preventDefault();        
                    this.openOptionList();
                    this.select.focus();
                }
                if( target == this.select && 
                    !isCloseList && 
                    keyCode == 'Space'){
                    event.preventDefault();        
                }    
            }
            if(event.type == 'click'){
                target = target.closest('.' + this.capeClass);
                
                if(target == this.selectCape && isCloseList){
                    event.preventDefault();
                    this.openOptionList();
                    this.select.focus();
                }    
            }


        }

        /**
        * Обработчик для закрытия списка с сохранением выбора
        * @param {Event} event объект событие
        */
        closeWithSaveListHandler(event){

            let target = event.target;
            let keyCode = event.code;
            let type = event.type;
            let isOpenedList = window.getComputedStyle(this.list).display == "flex";

            // добавить фокусировку на select
            this.select.focus();

            let select = target.closest('#' + this.selectID);
            let item = target.closest('.' + this.itemListClass);

            if(type == 'click' && item !== null){
                event.preventDefault();

                let idx = 0;
                for(let i = 0; i < this.itemsList.length; i++){
                    if(this.itemsList[i] == item){
                        idx = i;
                        break; 
                    }
                }
                this._clearItemHover();
                this._setItemHover(idx);
                this.closeWithSaveList();        
            }
            if(type == 'keydown' && select !== null && keyCode == 'Enter' && isOpenedList){
                event.preventDefault();
                this.closeWithSaveList();
            }
            this.select.focus();
        }
        /**
         * перемещает подсветку вверх по списку
         * @param {Event} event объект события
         */
        moveBacklightHandler(event){
            
            let target = event.target;
            let keyCode = event.code;
            let type = event.type;
            let isOpenedList = window.getComputedStyle(this.list).display == "flex";

            // добавить фокусировку на target
            this.select.focus();

            console.log('moveBacklightHandler: keyCode = ', keyCode);

            console.log('moveUpHandler: target = ', target);


            target = target.closest('#' + this.selectID);
            if( target !== null || isOpenedList ){
                if( keyCode == 'ArrowUp' || keyCode == 'ArrowLeft' ){
                    event.preventDefault();
                    this.moveToPrevItem();        
                }
                if(keyCode == 'ArrowDown' || keyCode == 'ArrowRight'){
                    event.preventDefault();
                    this.moveToNextItem();
                }
                
            }
        }
        closeWithoutSaveListHandler(event){
            let target = event.target;
            let type = event.type;
            let isOpenedList = window.getComputedStyle(this.list).display == "flex";

            console.log('closeWithoutSaveListHandler: type = ', type);

            if(event.type == 'keydown'){
                let keyCode = event.code;
                target = target.closest('#' + this.selectID);

                if(target == this.select && isOpenedList && ( keyCode == 'Escape' || keyCode == 'Tab')){
                    event.preventDefault();
                    this.closeWithoutSaveList();
                    this.select.focus();
                }
            }
            if(event.type == 'click'){
                let selectTarget = target.closest('#' + this.selectID);
                target = target.closest('.' + this.listClass);

                if(selectTarget == this.select){
                    event.preventDefault();
                }
                if(isOpenedList && (target === null || selectTarget == this.select)){
                    this.closeWithoutSaveList();
                }
            }

        }
        /**
         * Перемещает подсветку в списке в соответствии с перемещением курсора
         * @param {Event} event Объект события
         */
        hoverHandler(event){
            let target = event.target;
            target = target.closest('.' + this.itemListClass);
            if(target !== null){
                this._clearItemHover();
                target.classList.add(this.classOfHoveredItem);
            }
        }
        /**
         * Открывает список 
         */
        openOptionList(){
            this._clearItemHover();
            this._setItemHover(this.select.selectedIndex);

            let self = this;
            window.requestAnimationFrame(()=>{
                self.list.style.display = "flex";
            });
        }
        /**
         * Закрывает список и устанавливает выбранный пункт как selected в форме
         */
        closeWithSaveList(){
            this._setSelectOption();

            let self = this;
            window.requestAnimationFrame(()=>{
                self.list.style.display="none";
            });
        }
        /**
         * Закрывает список без сохранения
         */
        closeWithoutSaveList(){
            let idx = this.select.selectedIndex;

            this._clearItemHover();
            this._setItemHover(idx);

            let self = this;
            window.requestAnimationFrame(()=>{
                self.list.style.display="none";
            });
        }
        /**
         * Перемещает на один пункт вниз  в списке и устанавливает это значение для select
         */
        moveToNextItem(){
            this._moveDown();
            this._setSelectOption();
        }
        /**
         * Перемещает на один пункт вверх  в списке и устанавливает это значение для select
         */
        moveToPrevItem(){
            this._moveUp();
            this._setSelectOption();
        }
        /**
         * Устанавливает нужное value в select в соответствии с выбранным пунктом
         */
        _setSelectOption(){
            let selectedItemIndex = this._getCurrentHoverIndex();
            
            this.select.selectedIndex = selectedItemIndex;

            this._removeSelectIcon();

            this.select.classList.add(this.iconClassList[selectedItemIndex]);
        }
        /**
         * Устанавливает "подсветку" в списке в соответствии с выбранным пунктом в select
         * и стилизует select в соответствии с выбранным пунктом
         * (нужна при инициализации)
         */
        _setInitSelectOption(){
            let selectedItemIndex = this.select.selectedIndex;
            this._removeSelectIcon();
            this.select.classList.add(this.iconClassList[selectedItemIndex]);
            this._setItemHover(selectedItemIndex);
        }
        /**
         * удаление текущей иконки в select
         */
        _removeSelectIcon(){
            for(let i = 0; i < this.iconClassList.length; i++){
                if(this.select.classList.contains(this.iconClassList[i])){
                    this.select.classList.remove(this.iconClassList[i]);
                }
            }
        }
        /**
         * Устанавливает подсветку на пункт с индексом idx в списке
         * @param {integer} idx индекс пункта в списке
         */
        _setItemHover(idx){
            this._clearItemHover();
            this.itemsList[idx].classList.add(this.classOfHoveredItem);
        }
        /**
         * Убирает подсветку у всех пунктов списка
         */
        _clearItemHover(){
            for(let i = 0; i < this.itemsList.length; i++){
                if(this.itemsList[i].classList.contains(this.classOfHoveredItem)){
                    this.itemsList[i].classList.remove(this.classOfHoveredItem);
                }
            }
        }
        /**
         * Возвращает индекс текущего подсвеченного пункта
         * @returns {integer} индекс текущего подсвеченного пункта
         */
        _getCurrentHoverIndex(){
            for(let i = 0; i < this.itemsList.length; i++){
                if(this.itemsList[i].classList.contains(this.classOfHoveredItem)){
                    return i;
                }
            }
            throw new Error('no hover item');
        }
        /**
         * Перемещает подсветку пункта вверх
         * @returns {integer} новый индекс подсвеченного пункта
         */
        _moveUp(){
            let currentIdx = this._getCurrentHoverIndex();
            // let endIdx = this.itemsList - 1;
            if(currentIdx == 0) return;

            this._clearItemHover();
            this._setItemHover(--currentIdx);

            return currentIdx;
        }
        /**
         * Перемещает подсветку пункта вниз
         * @returns {integer} новый индекс подсвеченного пункта
         */
        _moveDown(){
            let currentIdx = this._getCurrentHoverIndex();
            console.log('_moveDown: currentIdx = ', currentIdx);
            if(currentIdx == this.itemsList.length - 1){
                console.log('_moveDown: return currentIdx = ', currentIdx);
                return currentIdx;
            } 

            this._clearItemHover();
            this._setItemHover(++currentIdx);

            return currentIdx;
        }

    }

    let customSelect = new CustomSelect(option);

});