var REGEX = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

_.mixin(_.str.exports());

(function poll() {
  setTimeout(function() {
    $("#output").empty();
    fetchBoardData();
    poll();
  }, 120000);
})();

var fetchBoardData = function() {
  var $boards = $("<div>")
    .html("<h2 id='preloader' class='animated fadeIn'>Loading boards...</h2>")
    .appendTo("#output");

  Trello.get("members/me/boards?filter=starred", { actions: "commentCard", actions_limit: 1000 }, function(boards) {
    if (boards.length === 0) {
      $("#preloader").text("No starred boards yet...");
    } else {
      $boards.empty();
    }

    $.each(boards, function(ix, board) {
      var $boardName = _.slugify(board.name);

      $("<span>")
        .attr({id: $boardName, target: "trello"})
        .addClass("board")
        .text(board.name)
        .appendTo($boards);

      var $boardContainer = $("#" + $boardName).wrap("<ul class='board-timeline'></ul>");

      _.each(board.actions, function(action) {
        var $actionContent = $("<li>");

        var $timeStamp = action.date.match(REGEX);
        var $date = $timeStamp[7] + "/" + $timeStamp[5] + "/" + _.trim($timeStamp[1], "20");
        var $time = $timeStamp[13];

        $("<time>")
          .attr({datetime: action.date})
          .addClass("time")
          .html("<span>" + $date + "</span>" + "<span>" + $time + "</span>")
          .appendTo($actionContent);

        $("<a>")
          .attr({title: action.memberCreator.fullName, href: "https://trello.com/" + action.memberCreator.username, target: "trello"})
          .addClass("icon")
          .html(action.memberCreator.initials)
          .appendTo($actionContent);

        $("<div>")
          .addClass("label")
          .html("<a class='label-title' target='trello' href='https://trello.com/c/" + action.data.card.shortLink + "'><h2>" + _(action.data.card.name).prune(40) + "</h2></a>" + "<p>" + action.data.text + "</p>")
          .appendTo($actionContent);

        $actionContent.appendTo($boardContainer.parent());
      });
    });
  });
};

var onAuthorize = function() {
  updateLoggedIn();
  $("#output").empty();

  Trello.members.get("me", function(member){
    $("#fullName").text(member.fullName);
    fetchBoardData();
  });
};

var updateLoggedIn = function() {
  var isLoggedIn = Trello.authorized();
  $("#loggedout").toggle(!isLoggedIn);
  $("#loggedin").toggle(isLoggedIn);
};

var logout = function() {
  Trello.deauthorize();
  updateLoggedIn();
};

Trello.authorize({
  interactive: false,
  success: onAuthorize
});

$("#connectLink").click(function(){
  Trello.authorize({
    name: "Natter",
    type: "popup",
    persist: true,
    success: onAuthorize
  });
});

$("#disconnect").click(logout);
