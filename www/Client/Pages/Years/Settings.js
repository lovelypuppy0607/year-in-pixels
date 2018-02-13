define([
   'Core/View',
   'jade!Pages/Years/Settings/Template',
   'Pages/Years/Data/statuses',
   'Views/List',
   'jade!Pages/Years/Settings/StatusDay',
   'Views/Informer',
   'css!Pages/Years/Settings/Style',
   'css!Pages/Years/StatusDay/Style'
], function(View, template, statuses, List, tStatusDay, Informer) {
   'use strict';

   return View.extend({
      className: 'settings',
      template: template,
      model: new Backbone.Model(window.user),

      selectors: {
         close: '.main>.top>.button[data-name="close"]',
         buttonTheme: '.button[data-name="change-theme"]',
         buttonPassword: '.button[data-name="change-password"]',
         buttonEditStatus: '.statuses .item>.buttons>.button[data-name="edit"]',
         buttonDeleteStatus: '.statuses .item>.buttons>.button[data-name="delete"]'
      },

      events: {
         'click close': 'hide',
         'click .statuses .button[data-name="add"]': 'statusAdd',
         'click buttonEditStatus': "_statusEdit",
         'click buttonDeleteStatus': "_statusDelete"
      },

      /**
       * Настройки дочерних компонентов
       */
      _childs: {
         /**
          * Меню редактирования темы
          */
         themeMenu: {
            include: ['Views/ButtonMenu', 'Core/Service'],
            callback: function(ButtonMenu, Service) {
               var menu = new ButtonMenu({
                  el: this.selector('buttonTheme'),
                  menu: {
                     items: [
                        {
                           content: "White",
                           attrs: {'data-name': 'White'}
                        }, {
                           content: "Black",
                           attrs: {'data-name': 'Black'}
                        }
                     ]
                  }
               });

               return menu;
            },
            events: {
               'clickItem': function(data) {
                  Service.post('User.ChangeTheme', data, {
                     success: function(result) {
                        window.location.reload();
                     }.bind(this)
                  });
               }
            }
         },

         /**
          * Форма редактирования пароля
          */
         formEditPassword: {
            include: ['Pages/Years/Settings/FormEditPassword'],
            callback: function(FormEditPassword) {
               return new FormEditPassword();
            }
         },

         /**
          * Форма редактирования пароля
          */
         buttonEditPassword: {
            include: ['Views/ButtonArea'],
            callback: function(ButtonArea, callback) {
               this.child('formEditPassword', function(form) {
                  var button = new ButtonArea({
                     el: this.selector('buttonPassword'),
                     floatArea: {
                        area: form.$el,
                        border: $('body'),
                        autoHide: false
                     }
                  });

                  // Обработчик закрытия формы
                  this.listenTo(form, 'cancel save', function () {
                     button.hideArea();
                  });

                  callback(button);
               });
            }
         },

         /**
          * Форма редактирования статуса
          */
         formEditStatus: {
            include: ['Pages/Years/Settings/FormEditStatus'],
            callback: function(FormEditStatus) {
               var form = new FormEditStatus({
                  el: this.$('.statuses>.form-edit-status')
               });

               return form;
            },
            events: {
               'save': function(values) {
                  var form = this.childs.formEditStatus;
                  var model = form.model;
                  var isNew = false;

                  // Уберем ссылку на модель
                  form.setModel(null);

                  /**
                   * Если есть модель, то редактировали,
                   * иначе создадим новую
                   */
                  if (model) {
                     model.set(values);
                  } else {
                     model = new statuses.model(values);
                     isNew = true;
                  }

                  // Сохраним модель
                  model.save(null, {
                     success: function() {
                        // Добавим модель в коллекцию
                        if (isNew) {
                           statuses.add(model);
                        }
                     },
                     error: function(model, options, res) {
                        new Informer({
                           type: 'error',
                           header: 'Error',
                           note: res.xhr.statusText
                        }).show();
                     }
                  });
               },
               'hide': function() {
                  this.childs.formEditStatus.setModel(null);
               }
            }
         }
      },

      /**
       * @param {Object} options
       */
      initialize: function(options) {
         View.prototype.initialize.apply(this, arguments);

         // Создать список статусов
         this.list = new List({
            el: this.$('.statuses>.list'),
            templateItem: tStatusDay,
            items: statuses
         });

         // Создать кнопку смены темы
         this.child('themeMenu');

         // Создать кнопку смены пароля
         this.child('buttonEditPassword');
      },

      /**
       * Добавить статус
       */
      statusAdd: function() {
         this.child('formEditStatus', function(form) {
            form.dataShow(true);
            form.setModel(null);
         });
      },

      /**
       * Обработчик редактирования статуса
       */
      _statusEdit: function(e) {
         this.child('formEditStatus', function(form) {
            var $button = $(e.target).closest(this.selector('buttonEditStatus'));

            form.setModel(statuses.get($button.data().id));
            form.dataShow(true);
         });
      },
      
      /**
       * Обработчик удаления статуса
       */
      _statusDelete: function(e) {
         var $button = $(e.target).closest(this.selector('buttonDeleteStatus'));
         var model = statuses.get($button.data().id);

         if (model) {
            model.destroy({
               wait: true
            });
         }
      }
   });
});