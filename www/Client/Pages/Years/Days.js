define([
   'Core/View',
   'jade!Pages/Years/Days/Template',
   'Pages/Years/Data/Days',
   'css!Pages/Years/Days/Style'
], function(View, template, days) {
   'use strict';

   console.log(days);

   return View.extend({
      className: 'days',

      template: template,

      /**
       * @config {Array.<String>}
       */
      nameMonths: [
         'January', 'February', 'March', 'April', 'May', 'June', 'July',
         'August', 'September', 'October', 'November', 'December'
      ],

      /**
       * Год
       * @config {Number}
       */
      year: new Date().getFullYear(),

      /**
       * @config {Object}
       */
      events: {
         'click .content>.markers-days>.marker-day': '_clickMarkerDay'
      },

      /**
       * @param {Object} options
       */
      _init: function(options) {
         this.year = parseInt(options.year || this.year);

         // Подпишимся на события коллекции дней
         this.listenToObject(days, {
            'change:status_id': '_changeStatusId'
         });
      },

      /**
       * Обработчик перед рендером
       * @param {Object} params
       */
      _beforeRender: function(params) {
         params.nameMonths = this.nameMonths;
         params.year = this.year;
         params.arrToDateSQL = this._arrToDateSQL;

         // Получим объект дат с корректными стилями
         var yearDays = days.where({
            year: this.year
         });

         params.yearDays = _.reduce(yearDays, function(result, day) {
            var status = day.status();

            if (status) {
               result[day.get('dateSQL')] = {
                  style: status.get('styleMarker'),
                  note: status.get('note')
               };
            }

            return result;
         }, {});
      },

      /**
       * Преобразовать массив чисел в дату формата YYYY-MM-DD
       * @param {Array.<Number>} values
       */
      _arrToDateSQL: function(values) {
         return _.map(values, function(value) {
            return value < 10 ? ('0' + value) : value;
         }, this).join('-');
      },

      /**
       * Клик по маркеру дня
       */
      _clickMarkerDay: function(e) {
         var $marker = $(e.target);

         this.trigger('clickDay', $marker.data(), $marker, e);
      },

      /**
       * Обработчик изменения статуса дня в коллекции дней
       * @param {Day.Model} model
       */
      _changeStatusId: function(model) {
         this.$('.content>.markers-days>.marker-day[data-date="' + model.get('dateSQL') + '"]')
            .attr('style', model.status().get('styleMarker'));
      }
   });
});