/** @jsx React.DOM */

define(['react', 'd3', 'calHeatmap'],
  function(React, d3, CalHeatMap) {
  var Calendar = React.createClass({
    propTypes: {
      bucketId: React.PropTypes.number.isRequired
    },

    componentDidMount: function() {
      if(this.props.bucketId) {
        var that = this;
        var dt = new Date();
        var currentMonth = dt.getMonth();
        var month = currentMonth;
        var futureDaysInMonth = ['now'];
        var daysOffset = 1;
        dt.setDate(dt.getDate() + daysOffset++);

        while(month === currentMonth) {
          futureDaysInMonth.push(dt);
          dt = new Date();
          dt.setDate(dt.getDate() + daysOffset++);
          month = dt.getMonth();
        }


        var cal = new CalHeatMap();
        cal.init({
          itemSelector: '#cal-heatmap' + that.props.bucketId,
          domain: 'month',
          range : 3,
          start: new Date().setMonth(new Date().getMonth() - 2),
          displayLegend: false,
          legend: [1, 5, 10, 15],
          highlight: futureDaysInMonth
        });
        $.ajax({
          url: '/dmpster/bucket/' + that.props.bucketId + '/hits.json',

        }).done(function(data){
          cal.update(data);
        });
      }
    },

    render: function() {
      var chartId = "cal-heatmap" + this.props.bucketId;
      return (<div id={chartId} className="heatmap"></div>);
    },
  });

  return Calendar;
});
