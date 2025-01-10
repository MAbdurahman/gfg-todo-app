/*===============================================================
         Scripts for the preloader
==================================================================*/
$(window).on('load', function () {
   $('#preloader-gif, #preloader').fadeOut(3000, function () {
   });

});

/*===============================================================
          Scripts for 2025-01-05-todo-app
==================================================================*/
window.onload = function () {
   let localToDoList = getInitialTodoList();

   /************************* variables *************************/
   const addButton = document.getElementById('add-button');
   const addInput = document.getElementById('add-input');
   const toDoList = document.getElementById('list');
   const counter = document.getElementById('counter');
   const maxLength = addInput.getAttribute('maxlength');
   const windowScreen = window.screen.availWidth;

   let isEditing = false;
   let editID = '';
   let editItem;
   let editItemText;
   let editItemIsChecked = false;

   let draggedItem = null;

   if (navigator.storage && navigator.storage.persisted) {

      navigator.storage.persisted().then((wellWasIt) => {
         if (!wellWasIt) {
            console.log('WellWasIt is not supported and is set to', wellWasIt);
         }
         navigator.storage.persist().then((allowed) => {
            if (!allowed) {
               allowed = true
               console.log('Persisted storage is set to', allowed);
            }
         });
      });
   }

   if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
         if (persistent) {
            console.log('Storage will not be cleared except by explicit user action');

         } else {
            console.log('Storage may be cleared by the UA under storage pressure.');

         }
      });
   }

   if (windowScreen <= 320) {
      addInput.setAttribute('maxlength', '24');
      counter.innerText = '24';

   } else {
      addInput.setAttribute('maxlength', '28');
      counter.innerText = '28';

   }

   /************************* functions *************************/
   /**
    * @description - adds a todoItem to the toDoList with clicking the addButton
    * @param e - the click event of the addButton
    */
   function addTodoItem(e) {
      let inputValue = addInput.value.trim();
      const id = self.crypto.randomUUID();
      let isChecked = false;
      let top = setElementPositionTop();

      if (inputValue && !isEditing) {
         createListItem(id, inputValue, isChecked, top);
         addTodoItemToLocalStorage(id, inputValue, isChecked, top);
         setToDefaultSettings();

      } else if (inputValue && isEditing) {
         editItem.innerHTML = inputValue;
         updateEditTodoItemToLocalStorage(editID, inputValue, editItemIsChecked);
         updateIsCheckedToLocalStorage(editID, editItemIsChecked);
         setToDefaultSettings();

         swal('Your todo item was successfully edited!', {
            icon: 'success'
         });

      } else {
         swal('Invalid Entry', 'Enter A Valid Entry!', 'error');
      }

   }//end of addTodoItem function

   /**
    * @description - adds a todoItem to the toDoList with pressing the enter key
    * @param e - the keydown event of input[type=text]
    */
   function addTodoItemWithEnterKey(e) {
      if (e.keyCode === 13) {
         let inputValue = addInput.value.trim();
         const id = self.crypto.randomUUID();
         let isChecked = false;
         let top = setElementPositionTop();

         if (inputValue && !isEditing) {
            let attr1 = document.createAttribute('data-id');
            let attr2 = document.createAttribute('data-top');
            attr1.value = id;
            attr2.value = top.toString();
            isChecked = hasClass('input.checkbox', 'completed');

            createListItem(id, inputValue, isChecked, top);
            addTodoItemToLocalStorage(id, inputValue, isChecked, top);
            setToDefaultSettings();

         } else if (inputValue && isEditing) {
            editItem.innerHTML = inputValue.trim();

            updateEditTodoItemToLocalStorage(
               editID,
               inputValue.trim(),
               editItemIsChecked
            );
            updateIsCheckedToLocalStorage(editID, editItemIsChecked);
            setToDefaultSettings();

            swal('Your todo item was successfully edited!', {
               icon: 'success'
            });

         } else {
            swal('Invalid Entry', 'Enter A Valid Entry!', 'error');

         }
      }

   }//end of addToDoItemWithEnterKey Function

   /**
    * @description - adds the text content of the todoItem to the input[type=text] for
    * editing
    * @param e - the click event of clicking the fa-edit icon
    */
   function editTodoItem(e) {
      if (e.target.classList.contains('fa-edit')) {
         const todoItem = e.target.parentElement.parentElement;
         editID = todoItem.dataset.id;
         let elem =
            e.target.parentElement.parentElement.childNodes[1].childNodes[0]
               .nextSibling;
         editItemIsChecked = hasClass(elem, 'completed');

         isEditing = true;
         addButton.innerText = 'Edit Item';
         editItem = e.target.parentNode.parentNode.querySelector('.item');
         editItemText = editItem.textContent;
         addInput.value = editItemText;
         getCharacterCount();
         addInput.focus();

      }

   }//end of editTodoItem Function

   /**
    * @description - deletes the todoItem from the toDoList
    * @param e - the click event of clicking the fa-trash-alt icon
    */
   function deleteTodoItem(e) {
      if (e.target.classList.contains('fa-trash-alt')) {
         swal({
            title: 'Are you sure?',
            text: 'Once deleted, impossible to recover!',
            icon: 'warning',
            buttons: true,
            dangerMode: true
         }).then(willDelete => {
            if (willDelete) {
               const todo = e.target.parentElement.parentElement;
               const id = todo.dataset.id;

               toDoList.removeChild(todo);
               setToDefaultSettings();
               removeTodoItemFromLocalStorage(id);

               swal('Your todo item has been deleted!', {
                  icon: 'success'
               });

            } else {
               swal('Your todo item is safe!', {
                  icon: 'info'
               });

            }
         });
      }

   }//end of deleteTodoItem Function

   /**
    * @description - toggles the completed class to the todoItem and calls function to
    * update completed status to localStorage
    * @param e - the click event of clicking the todoItem
    */
   function updateIsCheckedStatus(e) {
      const id = e.target.parentElement.parentElement.dataset.id;

      if (e.target.checked === true) {
         e.target.setAttribute('class', 'completed');
         updateIsCheckedToLocalStorage(id, true);

      } else {
         e.target.removeAttribute('class', 'completed');
         updateIsCheckedToLocalStorage(id, false);

      }
   }//end of updateIsCheckedStatus Function

   /**
    * @description - creates the list item for the toDoList
    * @param id - todoItem ID
    * @param todoItem - todoItem text content
    * @param isChecked - a boolean, whether the todoItem is completed or not
    * @param top - the offsetTop position of the todoItem in relation to the
    * toDoList (its parent)
    */
   function createListItem(id, todoItem, isChecked, top) {
      let attr1 = document.createAttribute('data-id');
      let attr2 = document.createAttribute('data-top');
      attr1.value = id;
      attr2.value = top;

      const template = document.querySelector('#template');
      const clone = document.importNode(template.content, true);
      clone.querySelector('.todo-item').setAttributeNode(attr1);
      clone.querySelector('.todo-item').setAttributeNode(attr2);
      clone.querySelector('.todo-item').setAttribute('draggable', 'true');
      clone.querySelector('.item').textContent = todoItem;
      clone
         .querySelector('.checkbox')
         .addEventListener('click', updateIsCheckedStatus);
      isChecked = clone
         .querySelector('.checkbox')
         .classList.contains('completed');
      clone.querySelector('.checkbox').checked = isChecked;

      toDoList.appendChild(clone);

      // updateElementTopToLocalStorage(id);

   } //end of the createListItem function

   /**
    * @description -
    * @param id
    * @param todoItem
    * @param isChecked
    * @param top
    */
   function createDisplayListItem(id, todoItem, isChecked, top) {
      let attr1 = document.createAttribute('data-id');
      let attr2 = document.createAttribute('data-top');
      attr1.value = id;
      attr2.value = top;

      const template = document.querySelector('#template');
      const clone = document.importNode(template.content, true);
      clone.querySelector('.todo-item').setAttributeNode(attr1);
      clone.querySelector('.todo-item').setAttributeNode(attr2);
      clone.querySelector('.item').textContent = todoItem;
      clone
         .querySelector('.checkbox')
         .addEventListener('click', updateIsCheckedStatus);
      isChecked
         ? clone.querySelector('.checkbox').classList.add('completed')
         : clone.querySelector('.checkbox').classList.remove('completed');
      clone.querySelector('.checkbox').checked = isChecked;

      toDoList.appendChild(clone);

      // updateElementTopToLocalStorage(id);

   } // end of createDisplayListItem function

   /**
    * @description
    */
   function displayTodoItems() {
      localToDoList = getLocalStorage();

      if (localToDoList.length > 0) {
         localToDoList.forEach(todo =>
            createDisplayListItem(todo.id, todo.todoItem, todo.isChecked, todo.top));
      }

      let todoItems = document.querySelectorAll('.todo-item');
      todoItems = Array.from(todoItems);
      let positionY;
      console.log(todoItems)
      for (let item of todoItems) {
         /*positionY = getElementPositionTop(item);*/
         positionY = setElementPositionTop();
         item.dataset.top = positionY.toString();
         console.log(positionY);
      }

      for (let index in localToDoList) {
         if (localToDoList[index].id === todoItems[index].dataset.id) {
            localToDoList[index].top = todoItems[index].dataset.top;
         }
      }

      localToDoList.sort((a, b) => a.top - b.top);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoList));

   } //end of displayTodoItems function

   /**
    * @description
    * @returns {any|*[]} - an array of todoItem Objects or an empty Array
    */
   function getInitialTodoList() {
      /************************* get the gfg-toDoApp *************************/
      const localTodoList = localStorage.getItem('gfg-toDoApp');

      /************************* parse gfg-toDoApp to JSON format, if not empty *************************/
      if (localTodoList) {
         return JSON.parse(localTodoList);
      }

      /************************* localStorage is empty, set it to 'gfg-toDoApp' *************************/
      localStorage.setItem('gfg-toDoApp', []);
      return [];

   } //end of getInitialTodoList function

   /**
    * @description
    * @returns {any|*[]} - an array of todoItem Objects or an empty Array
    */
   function getLocalStorage() {
      return localStorage.getItem('gfg-toDoApp') ? JSON.parse(localStorage.getItem('gfg-toDoApp')) : [];

   }//end of getLocalStorage function

   /**
    * @description
    * @param id
    * @param todoItem
    * @param isChecked
    * @param top
    */
   function addTodoItemToLocalStorage(id, todoItem, isChecked, top) {
      const todo = {
         id,
         todoItem,
         isChecked,
         top
      };

      let localStorageTodoListArr = getLocalStorage();
      localStorageTodoListArr.push(todo);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localStorageTodoListArr));

   }//end of addTodoItemToLocalStorage Function

   /**
    * @description - removes todoItem from localStorage
    * @param id - todoItem ID
    */
   function removeTodoItemFromLocalStorage(id) {
      let localStorageTodoListArr = getLocalStorage();
      localStorageTodoListArr = localStorageTodoListArr.filter(todo => todo.id !== id);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localStorageTodoListArr));

   }//end of removeTodoItemFromLocalStorage Function

   /**
    * @description - updates the completed state of the todoItem to localStorage
    * @param id - the todoItem ID
    * @param isChecked - true or false, whether the todoItem is completed
    */
   function updateIsCheckedToLocalStorage(id, isChecked) {
      let localToDoListArr = getLocalStorage();
      localToDoListArr = localToDoListArr.map(function (todo) {
         if (todo.id === id) {
            todo.isChecked = isChecked;
         }
         return todo;
      });

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoListArr));

   } //end of updateIsCheckedToLocalStorage function

   /**
    * @description
    * @param id
    * @param top
    */
   function updateElementTopToLocalStorage(id, top) {
      let localToDoListArr = getLocalStorage();
      localToDoListArr = localToDoListArr.map(todo => {
         if (todo.id === id) {
            todo.top = top;
         }
         return todo;

      });

      localToDoListArr.sort((a, b) => a.top - b.top);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoListArr));

   }//end of updateElementTopToLocalStorage Function

   /**
    * @description
    * @param id
    * @param todoItem
    * @param isChecked
    */
   function updateEditTodoItemToLocalStorage(id, todoItem, isChecked) {
      let localToDoListArr = getLocalStorage();
      localToDoListArr = localToDoListArr.map(todo => {
         if (todo.id === id) {
            todo.todoItem = todoItem;
            todo.isChecked = isChecked;
         }
         return todo;
      });

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoListArr));

   } //end of updateEditTodoItemToLocalStorage function

   /**
    * @description - sets the default settings
    */
   function setToDefaultSettings() {
      addButton.innerText = 'Add Item';
      isEditing = false;
      editID = '';
      editItemIsChecked = false;

      setTimeout(() => {
         addInput.value = '';
         getCharacterCount();
      }, 250);
      addInput.focus();

   } //end of setToDefaultSettings function

   /**
    * @description - counts remaining character count for input[type=text]
    */
   function getCharacterCount() {
      let characterCount = maxLength - addInput.value.length;
      characterCount < 10 ? counter.innerText = `0${characterCount}` : counter.innerText = `${characterCount}`;

   } //end of the getCharacterCount function


   function getElementPositionTop(elem) {
      return Math.round(elem.offsetTop);

   }//end of getElementPositionY Function

   /**
    * @description - sets the initial position top of the todoItem
    * @returns {string}
    */
   function setElementPositionTop() {
      let position;

      if (toDoList.lastElementChild === null || toDoList.lastElementChild === undefined) {
         position = 0;

      } else {
         position = Math.round(toDoList.lastElementChild.offsetTop) + 43;

      }
      return position.toString();

   }//end of setElementPositionTop Function

   /**
    * @description - checks whether an element has a class or not
    * @param elem - the element
    * @param namedClass - the class name
    * @returns {boolean} - true if the element has the named class, otherwise,
    * returns false.
    */
   function hasClass(elem, namedClass) {
      return ('' + elem.className + '').indexOf('' + namedClass + '') > -1;

   } //end of hasClass function

   function updateElementPositionTop() {
      let todoItems = document.querySelectorAll('.todo-item');
      todoItems = Array.from(todoItems);
      console.log(todoItems);
      /*let positionY;
      for (let item of todoItems) {
         positionY = setElementPositionTop();
         item.dataset.top = positionY.toString();

      }

      for (let index in todoItems) {
         if (localToDoList[index].id === todoItems[index].dataset.id) {
            localToDoList[index].top = todoItems[index].top;
         }
      }

      for (let index in localToDoList) {
         updateElementTopToLocalStorage(localToDoList[index].id, localToDoList[index].top);
      }

      localToDoList.sort((a, b) => a.top - b.top);


      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoList));*/

   }//end of updateElementPositionTop Function

   /**
    * @description
    * @param container
    * @param y
    * @returns {*}
    */
   function getDragAfterElement(container, y) {
      const draggableElements = [
         ...container.querySelectorAll('li:not(.dragging)')
      ];

      return draggableElements.reduce(
         (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
               return {
                  offset: offset,
                  element: child
               };
            } else {
               return closest;
            }
         },
         {
            offset: Number.NEGATIVE_INFINITY
         }
      ).element;

   }//end of getDragAfterElement Function

   /**
    * @description
    * @param e
    */
   function doDragStart(e) {
      draggedItem = e.target;

      setTimeout(() => {
         e.target.style.display = 'none';
      }, 0);

   }//end of doDragStart Function

   function doDragEnd(e) {
      setTimeout(() => {
         e.target.style.display = '';
         draggedItem = null;
      }, 0);

   }//end of doDragEnd Function

   /**
    * @description
    * @param e
    */
   function doDragOver(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(toDoList, e.clientY);

      if (afterElement === null) {
         toDoList.appendChild(draggedItem);

      } else {
         toDoList.insertBefore(draggedItem, afterElement);
      }
      // updateElementPositionTop();

   }//end of doDragOver Function

   /************************* event listeners *************************/
   window.addEventListener('DOMContentLoaded', getInitialTodoList);
   addButton.addEventListener('click', addTodoItem);
   addInput.addEventListener('keydown', addTodoItemWithEnterKey);
   addInput.addEventListener('keyup', getCharacterCount);
   toDoList.addEventListener('click', deleteTodoItem);
   toDoList.addEventListener('click', editTodoItem);
   toDoList.addEventListener('dragstart', doDragStart);
   toDoList.addEventListener('dragend', doDragEnd);
   toDoList.addEventListener('dragover', doDragOver);

   displayTodoItems();

};