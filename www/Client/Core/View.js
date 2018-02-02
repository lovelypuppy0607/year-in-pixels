define(function() {
   'use strict';

   return Backbone.View.extend({
      /**
       * Шаблон
       * @config {Function}
       */
      template: null,

      /**
       * Роутер
       * @config {Backbone.Router}
       */
      router: null,

      /**
       * Карта селекторов
       * @config {Object}
       */
      selectors: {},

      /**
       * @param {Object} options
       * @param {Function} [options.template]
       * @param {Boolean} [options.firstRender]
       */
      initialize: function(options) {
         options = options instanceof Object ? options : {};

         // Темлейт
         this.template = options.template || this.template;

         // Роутер
         this.router = options.router || this.router;

         // Произведем рендер, если это необходимо
         if (options.firstRender !== false) {
            this.render(options);
         }
      },

      /**
       * Рендер
       * @param {Object} [params]
       */
      render: function(params) {
         if (this.template) {
            params.model = params.model || this.model;

            this.$el.html(this.template(params || {}));
         }

         return this;
      },

      /**
       * Записать url
       * @param {String} url
       * @param {Object} [options]
       */
      navigate: function() {
         if (this.router) {
            this.router.navigate.apply(this.router, arguments);
         }
      },

      /**
       * Получить селектор по ключу
       * @param {String} key
       */
      selector: function(key) {
         return this.selectors[key] || null;
      },

      /**
       * Получить jQuery объект по ключу из карты селекторов
       * @param {String} key
       */
      $element: function(key) {
         return this.$(this.selector(key));
      },

      /**
       * Сменить отображения jQuery объекта
       * @param {String} key
       * @param {Boolean} value
       */
      $elementDataShow: function(key, value) {
         this.$element(key).attr('data-show', value);
      },

      /**
       * Сменить отображение
       * @param {Boolean} value
       */
      dataShow: function(value) {
         this.$el.attr('data-show', value);

         if (value === false) {
            this.trigger('hide');
         } else {
            this.trigger('show');
         }
      }
   });
});