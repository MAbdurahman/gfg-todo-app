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

   if (windowScreen <= 320) {
      addInput.setAttribute('maxlength', 24);
      counter.innerText = 24;

   } else {
      addInput.setAttribute('maxlength', 28);
      counter.innerText = 28;

   }

   /************************* functions *************************/
   /**
    * @description -
    * @param e
    */
   function addTodoItem(e) {
      let inputValue = addInput.value.trim();
      const id = self.crypto.randomUUID();
      let isChecked = false;

      if (inputValue && !isEditing) {
         createListItem(id, inputValue, isChecked);
         addToLocalStorage(id, inputValue, isChecked);
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
    * @description
    * @param e
    */
   function addTodoItemWithEnterKey(e) {
      if (e.keyCode === 13) {
         let inputValue = addInput.value.trim();
         const id = self.crypto.randomUUID();
         let isChecked = false;

         if (inputValue && !isEditing) {
            let attr = document.createAttribute('data-id');
            attr.value = id;
            isChecked = hasClass('input.checkbox', 'completed');

            createListItem(id, inputValue, isChecked);
            addToLocalStorage(id, inputValue, isChecked);
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

   }//end of addToItemWithEnterKey Function

   /**
    * @description
    * @param e
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
    * @description
    * @param e
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
               removeFromLocalStorage(id);

               swal('Your todo item has been deleted!', {
                  icon: 'success'
               });

            } else {
               swal('Your todo item is safe!');

            }
         });
      }
   }//end of deleteTodoItem Function

   /**
    * @description -
    * @param e
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

   function createListItem(id, todoItem, isChecked) {
      let attr = document.createAttribute('data-id');
      attr.value = id;

      const template = document.querySelector('#template');
      const clone = document.importNode(template.content, true);
      clone.querySelector('.todo-item').setAttributeNode(attr);
      clone.querySelector('.item').textContent = todoItem;
      clone
         .querySelector('.checkbox')
         .addEventListener('click', updateIsCheckedStatus);
      isChecked = clone
         .querySelector('.checkbox')
         .classList.contains('completed');
      clone.querySelector('.checkbox').checked = isChecked;

      toDoList.appendChild(clone);

   } //end of the createListItem function

   /**
    * @description
    * @param id
    * @param todoItem
    * @param isChecked
    */
   function createDisplayListItem(id, todoItem, isChecked) {
      let attr = document.createAttribute('data-id');
      attr.value = id;

      const template = document.querySelector('#template');
      const clone = document.importNode(template.content, true);
      clone.querySelector('.todo-item').setAttributeNode(attr);
      clone.querySelector('.item').textContent = todoItem;
      clone
         .querySelector('.checkbox')
         .addEventListener('click', updateIsCheckedStatus);
      isChecked
         ? clone.querySelector('.checkbox').classList.add('completed')
         : clone.querySelector('.checkbox').classList.remove('completed');
      clone.querySelector('.checkbox').checked = isChecked;

      toDoList.appendChild(clone);

   } // end of createDisplayListItem function

   /**
    * @description
    */
   function displayTodoItems() {
      localToDoList = getLocalStorage();

      if (localToDoList.length > 0) {
         localToDoList.forEach(todo => createDisplayListItem(todo.id, todo.todoItem, todo.isChecked));
      }
   } //end of displayTodoItems function

   /**
    * @description
    * @returns {any|*[]}
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
    * @returns {any|*[]}
    */
   function getLocalStorage() {
      return localStorage.getItem('gfg-toDoApp') ? JSON.parse(localStorage.getItem('gfg-toDoApp')) : [];

   }//end of getLocalStorage function

   /**
    * @description
    * @param id
    * @param todoItem
    * @param isChecked
    */
   function addToLocalStorage(id, todoItem, isChecked) {
      const todo = {
         id,
         todoItem,
         isChecked
      };

      let localStorageTodoListArr = getLocalStorage();
      localStorageTodoListArr.push(todo);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localStorageTodoListArr));

   }//end of addToLocalStorage Function

   /**
    * @description
    * @param id
    */
   function removeFromLocalStorage(id) {
      let localStorageTodoListArr = getLocalStorage();
      localStorageTodoListArr = localStorageTodoListArr.filter(todo => todo.id !== id);

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localStorageTodoListArr));

   }//end of removeFromLocalStorage Function

   /**
    * @description
    * @param id
    * @param isChecked
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
    * @param todoItem
    * @param isChecked
    */
   function updateEditTodoItemToLocalStorage(id, todoItem, isChecked) {
      let localToDoListArr = getLocalStorage();
      localToDoListArr = localToDoListArr.map(function (todo) {
         if (todo.id === id) {
            todo.todoItem = todoItem;
            todo.isChecked = isChecked;
         }
         return todo;
      });

      localStorage.setItem('gfg-toDoApp', JSON.stringify(localToDoListArr));

   } //end of updateEditTodoItemToLocalStorage function

   /**
    * @description
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
    * @description
    */
   function getCharacterCount() {
      let characterCount = maxLength - addInput.value.length;
      characterCount < 10 ? counter.innerText = `0${characterCount}` : counter.innerText = `${characterCount}`;

   } //end of the getCharacterCount function

   /**
    * @description
    * @param elem
    * @param namedClass
    * @returns {boolean}
    */
   function hasClass(elem, namedClass) {
      return ('' + elem.className + '').indexOf('' + namedClass + '') > -1;

   } //end of hasClass function

   /************************* event listeners *************************/
   window.addEventListener('DOMContentLoaded', getInitialTodoList);
   addButton.addEventListener('click', addTodoItem);
   addInput.addEventListener('keydown', addTodoItemWithEnterKey);
   addInput.addEventListener('keyup', getCharacterCount);
   toDoList.addEventListener('click', deleteTodoItem);
   toDoList.addEventListener('click', editTodoItem);

   displayTodoItems();

};